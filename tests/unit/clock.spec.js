import { createLocalVue, shallowMount } from '@vue/test-utils';
import { requestIdleCallback } from '@shopify/jest-dom-mocks';
import Vue from 'vue';
import Vuetify from 'vuetify';
import Vuex from 'vuex';

import '@formatjs/intl-displaynames/polyfill';
import '@formatjs/intl-displaynames/locale-data/en';

import storeConfig from '@/store/store';
import locales from '@/locales/localeList';

import Clock from '@/components/clock.vue';

Vue.use(Vuetify);

describe('clock.vue', () => {
    const localVue = createLocalVue();
    localVue.use(Vuex);

    let vuetify;
    let store;

    beforeEach(() => {
        vuetify = new Vuetify();
        store = new Vuex.Store(storeConfig);

        requestIdleCallback.mock();

        localStorage.clear();

        window.displayFormatters = {
            region: new Intl.DisplayNames(['en'], { type: 'region' }),
        };
    });

    afterEach(() => {
        requestIdleCallback.cancelIdleCallbacks();
        requestIdleCallback.restore();
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

    it('should return a city name related to the given timezone', () => {
        const wrapper = getShallowWapper(Clock, { searchid: 0 });

        expect(wrapper.vm.getCity).toMatch('London');

        wrapper.vm.timeZone = 'Europe/Berlin';
        expect(wrapper.vm.getCity).toMatch('Berlin');

        wrapper.vm.timeZone = 'test';
        expect(wrapper.vm.getCity).toMatch('London');

        wrapper.vm.timeZone = 'Asia/Shanghai';
        expect(wrapper.vm.getCity).toMatch('Shanghai');
    });

    test('convert timezone', (done) => {
        const wrapper = getShallowWapper(Clock, { searchid: 0 });

        expect(new Date().getTimezoneOffset()).toBe(0);

        wrapper.vm.timeZone = 'Europe/London';
        setTimeout(() => {
            expect(wrapper.vm.convertTimeZone(new Date('2021-09-27T01:00:00Z')) - new Date('2021-09-27T01:00:00Z')).toEqual(3600000);
            expect(wrapper.vm.convertTimeZone(new Date('2021-11-27T01:00:00Z')) - new Date('2021-11-27T01:00:00Z')).toEqual(0);
            done();
        }, 0);
    });
});
