import httpx
import re
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from logger import get_logger

logger = get_logger("CalendarEngine")

class AsyncCalendarEngine:
    def __init__(self, target_url: str):
        self.target_url = target_url

    async def fetch_and_parse_agenda(self) -> list:
        """Fetches public enterprise or Google iCal links and returns structured dictionary items."""
        if not self.target_url:
            return []

        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Lumina Smart Mirror OS"}
                response = await client.get(self.target_url, headers=headers, timeout=10.0)
                if response.status_code != 200 or not response.text.strip():
                    logger.warning(
                        f"Calendar server returned HTTP {response.status_code} ({len(response.text)} bytes) for {self.target_url}. "
                        f"If using Google Calendar (e.g. Workspace sunway.edu.np), check 'Access permissions for events' -> 'Make available to public' -> 'See all event details', or use the Secret Address in iCal format."
                    )
                    return []
                return self._parse_ical_payload(response.text)
            except Exception as e:
                logger.error(f"Calendar extraction anomaly: {e}", exc_info=True)
                return []

    def _parse_datetime_str(self, raw_val: str, is_end: bool = False):
        """Parses iCal DTSTART/DTEND string into timezone-aware local datetime tuple:
        (dt_local, date_str: YYYY-MM-DD, time_str: 09:00 AM, iso_str: YYYY-MM-DDTHH:MM:SS, is_all_day: bool).
        Handles UTC ('Z' suffix) and TZID parameters by converting to mirror system local timezone.
        """
        local_tz = datetime.now().astimezone().tzinfo

        # Extract TZID parameter if present e.g. DTSTART;TZID=Asia/Kathmandu:20260725T090000
        tzid_match = re.search(r"TZID=([^;:\"#]+)", raw_val)
        tzid = tzid_match.group(1).strip() if tzid_match else None

        val = raw_val.split(":")[-1].strip()
        is_utc = val.endswith("Z") or val.endswith("z")

        m = re.search(r"(\d{4})-?(\d{2})-?(\d{2})(?:T(\d{2})-?(\d{2})-?(\d{2})?)?", val)
        if not m:
            now = datetime.now().astimezone()
            return now, now.strftime("%Y-%m-%d"), "09:00 AM", now.strftime("%Y-%m-%dT%H:%M:%S"), False

        year, month, day, hour, minute, second = m.groups()

        if hour is not None and minute is not None:
            dt_naive = datetime(int(year), int(month), int(day), int(hour), int(minute), int(second or 0))
            if is_utc:
                dt_local = dt_naive.replace(tzinfo=timezone.utc).astimezone(local_tz)
            elif tzid:
                try:
                    dt_local = dt_naive.replace(tzinfo=ZoneInfo(tzid)).astimezone(local_tz)
                except Exception:
                    dt_local = dt_naive.replace(tzinfo=local_tz)
            else:
                dt_local = dt_naive.replace(tzinfo=local_tz)

            date_str = dt_local.strftime("%Y-%m-%d")
            time_str = dt_local.strftime("%I:%M %p")
            iso_str = dt_local.strftime("%Y-%m-%dT%H:%M:%S")
            return dt_local, date_str, time_str, iso_str, False
        else:
            # All Day event date (RFC 5545: DTEND for DATE is 00:00:00 of the end date)
            dt_local = datetime(int(year), int(month), int(day), 0, 0, 0, tzinfo=local_tz)
            date_str = f"{year}-{month}-{day}"
            time_str = "All Day"
            iso_str = f"{date_str}T00:00:00"
            return dt_local, date_str, time_str, iso_str, True

    def _parse_ical_payload(self, ical_text: str) -> list:
        events = []
        now = datetime.now().astimezone()

        # Unfold multiline iCal property strings (RFC 5545)
        unfolded_ical = re.sub(r"\r?\n[ \t]", "", ical_text)
        raw_events = re.findall(r"BEGIN:VEVENT.*?END:VEVENT", unfolded_ical, re.DOTALL)

        for raw_ev in raw_events:
            summary = re.search(r"SUMMARY:(.*)", raw_ev)
            dtstart = re.search(r"DTSTART[:;](.*)", raw_ev)
            dtend = re.search(r"DTEND[:;](.*)", raw_ev)
            location = re.search(r"LOCATION:(.*)", raw_ev)

            if summary and dtstart:
                raw_title = summary.group(1).strip()
                # Unescape standard iCal characters
                title = raw_title.replace(r"\,", ",").replace(r"\;", ";").replace(r"\\", "\\").replace(r"\n", " ")

                st_dt, date_str, time_str, iso_start, is_allday = self._parse_datetime_str(dtstart.group(1).strip(), is_end=False)

                if dtend:
                    end_dt, _, _, iso_end, _ = self._parse_datetime_str(dtend.group(1).strip(), is_end=True)
                else:
                    if is_allday:
                        end_dt = datetime(st_dt.year, st_dt.month, st_dt.day, 23, 59, 59, tzinfo=st_dt.tzinfo)
                    else:
                        end_dt = st_dt + timedelta(hours=1)
                    iso_end = end_dt.strftime("%Y-%m-%dT%H:%M:%S")

                # Filter out past events whose end time has already passed
                if end_dt < now:
                    continue

                loc_str = location.group(1).strip().replace(r"\,", ",") if location else "Virtual Hub"

                # Determine contextual layout priorities
                priority = "HIGH" if any(x in title.upper() for x in ["URGENT", "REVIEW", "CRITICAL", "MEETING", "EXAM", "DEADLINE"]) else "NORMAL"

                events.append({
                    "title": title,
                    "start": date_str,
                    "time": time_str,
                    "isoStart": iso_start,
                    "isoEnd": iso_end,
                    "location": loc_str,
                    "priority": priority
                })

        # Sort upcoming events sequentially by start time
        events.sort(key=lambda x: x["isoStart"])
        return events[:15]