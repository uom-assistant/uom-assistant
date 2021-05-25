import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        locale: localStorage.getItem('language') || 'en',
        localeDetail: null,
        packery: null,
        widgets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        subjects: [],
        timerMin: '00',
        timerHour: '00',
        todayEvents: [],
        nextDayFirstEvent: {},
        courseworks: {},
        errorList: [],
        backend: {},
        backendStatus: true,
        account: {},
        searchIndex: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
        searchNotification: {
            target: '',
            payload: null,
        },
        searchIndexChecker: 0,
        attendance: false,
        attendanceUpdated: 0,
        darkMode: false,
    },
    mutations: {
        setLocale(state, language) {
            state.locale = language;
        },
        setLocaleDetail(state, localeDetail) {
            state.localeDetail = localeDetail;
        },
        setPackery(state, packeryInstance) {
            state.packery = packeryInstance;
        },
        setWidgets(state, widgets) {
            state.widgets = widgets;
        },
        setSubjects(state, subjects) {
            state.subjects = subjects;
        },
        setTimerMin(state, timerMin) {
            state.timerMin = timerMin;
        },
        setTimerHour(state, timerHour) {
            state.timerHour = timerHour;
        },
        setTodayEvents(state, todayEvents) {
            state.todayEvents = todayEvents;
        },
        setNextDayFirstEvent(state, nextDayFirstEvent) {
            state.nextDayFirstEvent = nextDayFirstEvent;
        },
        setCourseworks(state, courseworks) {
            state.courseworks = courseworks;
        },
        addError(state, error) {
            const errorItem = error;
            errorItem.id = new Date().valueOf();
            state.errorList.push(errorItem);
        },
        removeError(state, index) {
            state.errorList.splice(index, 1);
        },
        setBackend(state, backend) {
            state.backend = backend;
        },
        setBackendStatus(state, status) {
            state.backendStatus = status;
        },
        setAccount(state, account) {
            state.account = account;
        },
        setSearchIndex(state, data) {
            state.searchIndex[data.id] = data.payload;
            state.searchIndexChecker = new Date().valueOf();
        },
        setSearchNotification(state, data) {
            state.searchNotification = {
                target: data.target,
                payload: data.payload,
            };
        },
        setAttendance(state, data) {
            state.attendance = data;
            state.attendanceUpdated = new Date().valueOf();
        },
        setDarkMode(state, darkMode) {
            state.darkMode = darkMode;
        },
    },
    actions: {
    },
    modules: {
    },
});
