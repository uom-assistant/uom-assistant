/* eslint-disable no-tabs */
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vue from 'vue';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import shortKey from 'vue-shortkey';

import storeConfig from '@/store/store';
import locales from '@/locales/localeList';

import Calendar from '@/components/calendar.vue';

Vue.use(Vuetify);
Vue.use(shortKey);

describe('calendar.vue', () => {
    const localVue = createLocalVue();
    localVue.use(Vuex);

    let vuetify;
    let store;

    beforeEach(() => {
        vuetify = new Vuetify();
        store = new Vuex.Store(storeConfig);

        localStorage.clear();

        window.uomaTimeFormatters = {
            month: new Intl.DateTimeFormat('en', {
                month: 'short',
                day: 'numeric',
            }),
            day: new Intl.DateTimeFormat('en', {
                day: 'numeric',
            }),
            date: new Intl.DateTimeFormat('en', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                weekday: 'long',
            }),
            time: new Intl.DateTimeFormat('en', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            }),
        };
    });

    const getShallowWapper = (component, propsData) => shallowMount(component, {
        localVue,
        vuetify,
        store,
        propsData,
        mocks: {
            $t: (key) => key,
            $tc: (key) => key,
            $i18n: locales[0],
        },
    });

    it('should always be UTC', () => {
        expect(new Date().getTimezoneOffset()).toBe(0);
    });

    it('should update the current date and the start date of current week when called', () => {
        const wrapper = getShallowWapper(Calendar, { searchid: 6 });

        wrapper.vm.updateCurrentDate(new Date(2021, 8, 26));
        expect(wrapper.vm.currentDate).toMatch('2021-09-26');
        expect(wrapper.vm.currentWeekStart).toMatch('2021-09-26');

        wrapper.vm.updateCurrentDate(new Date(2021, 9, 6));
        expect(wrapper.vm.currentDate).toMatch('2021-10-06');
        expect(wrapper.vm.currentWeekStart).toMatch('2021-10-03');

        wrapper.vm.updateCurrentDate(new Date(2030, 5, 20));
        expect(wrapper.vm.currentDate).toMatch('2030-06-20');
        expect(wrapper.vm.currentWeekStart).toMatch('2030-06-16');
    });

    test('convert timezone', () => {
        const wrapper = getShallowWapper(Calendar, { searchid: 6 });

        expect(new Date().getTimezoneOffset()).toBe(0);
        expect(wrapper.vm.convertTimeZone(new Date('2021-09-27T01:00:00Z')) - new Date('2021-09-27T01:00:00Z')).toEqual(3600000);
        expect(wrapper.vm.convertTimeZone(new Date('2021-11-27T01:00:00Z')) - new Date('2021-11-27T01:00:00Z')).toEqual(0);
    });

    test('format date', () => {
        const wrapper = getShallowWapper(Calendar, { searchid: 6 });

        expect(wrapper.vm.getDate(new Date('2021-09-27T01:00:30'))).toMatch(new Date().getFullYear() === 2021 ? '27/9 01:00:30' : '27/9/2021 01:00:30');
        expect(wrapper.vm.getDate(new Date('2021-09-27T01:00:30'), false)).toMatch(new Date().getFullYear() === 2021 ? '27/9 01:00' : '27/9/2021 01:00');
    });

    test('calculate event progress percentage', () => {
        const wrapper = getShallowWapper(Calendar, { searchid: 6 });

        const day = {
            day: 4,
            month: 10,
            year: 2021,
        };
        wrapper.vm.currentTimeStamp = 1633356000000;

        expect(wrapper.vm.getEevntPercentage(1633354200000, 1633361400000, day)).toMatch('25%');
        expect(wrapper.vm.getEevntPercentage(1633354200000, 1633355200000, day)).toMatch('100%');
        expect(wrapper.vm.getEevntPercentage(1633361400000, 1633362400000, day)).toMatch('0%');
    });

    test('calculate event progress percentage for multi-day events', () => {
        const wrapper = getShallowWapper(Calendar, { searchid: 6 });

        const day = {
            day: 4,
            month: 10,
            year: 2021,
        };
        const nextDay = {
            day: 5,
            month: 10,
            year: 2021,
        };
        const currentTimeStamp = new Date(nextDay.year, nextDay.month - 1, nextDay.day).getTime();
        wrapper.vm.currentTimeStamp = currentTimeStamp - 1800 * 1000;

        expect(wrapper.vm.getEevntPercentage(currentTimeStamp - 3600 * 1000 * 2, currentTimeStamp + 3600 * 1000 * 2, day)).toMatch('75%');
        expect(wrapper.vm.getEevntPercentage(currentTimeStamp - 3600 * 1000 * 2, currentTimeStamp + 3600 * 1000 * 2, nextDay)).toMatch('0%');

        wrapper.vm.currentTimeStamp = currentTimeStamp;

        expect(wrapper.vm.getEevntPercentage(currentTimeStamp - 3600 * 1000 * 2, currentTimeStamp + 3600 * 1000 * 2, day)).toMatch('100%');
        expect(wrapper.vm.getEevntPercentage(currentTimeStamp - 3600 * 1000 * 2, currentTimeStamp + 3600 * 1000 * 2, nextDay)).toMatch('0%');

        wrapper.vm.currentTimeStamp = currentTimeStamp + 1800 * 1000;

        expect(wrapper.vm.getEevntPercentage(currentTimeStamp - 3600 * 1000 * 2, currentTimeStamp + 3600 * 1000 * 2, day)).toMatch('100%');
        expect(wrapper.vm.getEevntPercentage(currentTimeStamp - 3600 * 1000 * 2, currentTimeStamp + 3600 * 1000 * 2, nextDay)).toMatch('25%');
    });

    test('linkify text', () => {
        const wrapper = getShallowWapper(Calendar, { searchid: 6 });

        expect(wrapper.vm.linkify('test https://www.google.com test')).toMatch('test <a href="https://www.google.com" target="_blank" rel="noopener nofollow">https://www.google.com</a> test');
        expect(wrapper.vm.linkify('no link')).toMatch('no link');
        expect(wrapper.vm.linkify('oh https://here.is/a/super_looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog/ link')).toMatch('oh <a href="https://here.is/a/super_looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooog/" target="_blank" rel="noopener nofollow">https://here.is/a/super_looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo…</a> link');
    });

    it('should show a map when there is a map link', () => {
        const wrapper = getShallowWapper(Calendar, { searchid: 6 });

        expect(wrapper.vm.showMap('Location Name: Engineering Building A	\nUnit Code: COMP000000	\nParadigms	\n')).toMatch('');
        expect(wrapper.vm.showMap('Location Name: Engineering Building A	\nUnit Code: COMP000000	\nParadigms	\nLocation: 	\nMap Link: 	\nDirections: 	\nDirections: 	\n')).toMatch('');
        expect(wrapper.vm.showMap('Location Name: Engineering Building A	\nUnit Code: COMP000000	\nParadigms	\nLocation: https://www.google.com/maps/search/?api=1&query=53.467335,-2.234203&query_place_id=ChIJeziKgJKxe0gR8qUIiSmWKJo	\nMap Link:  [Google Maps](https://www.google.com/maps/search/?api=1&query=53.467335,-2.234203&query_place_id=ChIJeziKgJKxe0gR8qUIiSmWKJo)	\nDirections: Kilburn Building.	\nDirections: Kilburn Building.	\n')).toContain('src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAn46nX_pMvKfKcp5_Nqc4C3GCKj8CHJ7M&amp;q=place_id:ChIJeziKgJKxe0gR8qUIiSmWKJo"');
    });
});
