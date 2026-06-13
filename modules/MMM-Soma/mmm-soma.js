Module.register("MMM-Soma", {
    defaults: {
        scheduleApiUrl: "",
        noticeApiUrl: "",
        updateInterval: 300000,
    },

    getStyles: function () { return ["css/styles.css"]; },
    getTranslations: function () { return { en: "translations/en.json" }; },

    start: function () {
        Log.info("Initializing SOMA Engine: " + this.name);
        this.schedule = [];
        this.announcements = [];
        this.loaded = false;
        this.getData();

        var self = this;
        setInterval(function () { self.getData(); }, this.config.updateInterval);
    },

    getData: function () {
        this.sendSocketNotification("GET_SOMA_DATA", this.config);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "SOMA_DATA_RECEIVED") {
            this.schedule = payload.schedule;
            this.announcements = payload.announcements;
            this.loaded = true;
            this.updateDom();
        }
    },

    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.className = "soma-container";

        if (!this.loaded) {
            wrapper.innerHTML = "LOADING SOMA SYSTEMS...";
            wrapper.className = "dimmed light xsmall";
            return wrapper;
        }

        // --- THE SOMA DAY METRIC BAR ---
        var metricsContainer = document.createElement("div");
        metricsContainer.className = "soma-metric-bar-wrapper";

        var now = new Date();
        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        var diffMs = now - startOfDay;
        var pctOfDay = Math.floor((diffMs / 86400000) * 100);

        metricsContainer.innerHTML = `
            <div class="metric-label-container">
                <span class="dimmed xsmall">CYCLE METRIC</span>
                <span class="bright xsmall">${pctOfDay}% COMPLETED</span>
            </div>
            <div class="metric-track">
                <div class="metric-fill" style="width: ${pctOfDay}%;"></div>
            </div>
        `;
        wrapper.appendChild(metricsContainer);

        // --- Schedule Section ---
        var scheduleHeader = document.createElement("div");
        scheduleHeader.className = "module-header";
        scheduleHeader.innerHTML = "PERSONAL SCHEDULE";
        wrapper.appendChild(scheduleHeader);

        var scheduleList = document.createElement("ul");
        scheduleList.className = "small normal list-unstyled";

        if (this.schedule.length === 0) {
            scheduleList.innerHTML = `<li class="soma-list-item dimmed xsmall">No classes scheduled for today.</li>`;
        } else {
            this.schedule.forEach(item => {
                var li = document.createElement("li");
                li.className = "soma-list-item";
                li.innerHTML = `<span class="bright">${item.time}</span> <span class="dimmed">|</span> ${item.title}`;
                scheduleList.appendChild(li);
            });
        }
        wrapper.appendChild(scheduleList);

        // --- Notices Section ---
        var noticeHeader = document.createElement("div");
        noticeHeader.className = "module-header target-space";
        noticeHeader.innerHTML = "CAMPUS ANNOUNCEMENTS";
        wrapper.appendChild(noticeHeader);

        var noticeList = document.createElement("ul");
        noticeList.className = "xsmall list-unstyled";

        if (this.announcements.length === 0) {
            noticeList.innerHTML = "<li class='notice-item-premium dimmed xsmall'>No active campus announcements.</li>";
        } else {
            this.announcements.slice(0, 3).forEach(notice => {
                var li = document.createElement("li");
                li.className = "notice-item-premium";
                li.innerHTML = `<div class="notice-text">${notice.title}</div>`;
                noticeList.appendChild(li);
            });
        }
        wrapper.appendChild(noticeList);

        return wrapper;
    }
});