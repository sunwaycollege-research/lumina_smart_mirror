import httpx
import re
from datetime import datetime
from logger import get_logger

logger = get_logger("CalendarEngine")

class AsyncCalendarEngine:
    def __init__(self, target_url: str):
        self.target_url = target_url

    async def fetch_and_parse_agenda(self) -> list:
        """Fetches public enterprise iCal links and returns structured dictionary items."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.target_url, timeout=10.0)
                if response.status_code != 200:
                    logger.warning(f"Calendar server returned status code {response.status_code} for {self.target_url}")
                    return []
                return self._parse_ical_payload(response.text)
            except Exception as e:
                logger.error(f"Calendar extraction anomaly: {e}", exc_info=True)
                return []

    def _parse_ical_payload(self, ical_text: str) -> list:
        events = []
        raw_events = re.findall(r"BEGIN:VEVENT.*?END:VEVENT", ical_text, re.DOTALL)
        
        for raw_ev in raw_events:
            summary = re.search(r"SUMMARY:(.*)", raw_ev)
            dtstart = re.search(r"DTSTART[:;](.*)", raw_ev)
            dtend = re.search(r"DTEND[:;](.*)", raw_ev)
            location = re.search(r"LOCATION:(.*)", raw_ev)
            
            if summary and dtstart:
                title = summary.group(1).strip()
                start_raw = dtstart.group(1).strip()
                
                # Sanitize typical timestamp patterns
                start_clean = re.sub(r'VALUE=DATE:', '', start_raw).split('T')[0]
                
                # Determine simple contextual layout priorities
                priority = "HIGH" if any(x in title.upper() for x in ["URGENT", "REVIEW", "CRITICAL", "MEETING"]) else "NORMAL"
                
                events.append({
                    "title": title,
                    "start": start_clean,
                    "location": location.group(1).strip() if location else "Virtual Hub",
                    "priority": priority
                })
        
        # Sort upcoming events sequentially
        events.sort(key=lambda x: x["start"])
        return events[:5]