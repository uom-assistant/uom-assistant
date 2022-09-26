import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vue from 'vue';
import Vuetify from 'vuetify';
import Vuex from 'vuex';

import '@formatjs/intl-displaynames/polyfill';
import '@formatjs/intl-displaynames/locale-data/en';

import storeConfig from '@/store/store';
import locales from '@/locales/localeList';

import Mail from '@/components/mail.vue';

Vue.use(Vuetify);

describe('mail.vue', () => {
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
            relative: new Intl.RelativeTimeFormat('en', { numeric: 'auto' }),
        };
        window.displayFormatters = {
            region: new Intl.DisplayNames(['en'], { type: 'region' }),
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

    it('should find myself in a mail list', () => {
        const wrapper = getShallowWapper(Mail, { searchid: 8 });

        wrapper.vm.account.email = 'test@man.ac.uk';
        expect(wrapper.vm.meInList([
            {
                name: 'a',
                address: 'a@a.com',
            },
            {
                name: 'b',
                address: 'b@b.com',
            },
        ])).toBe(false);
        expect(wrapper.vm.meInList([
            {
                name: 'a',
                address: 'a@a.com',
            },
            {
                name: 'test',
                address: 'test@man.ac.uk',
            },
            {
                name: 'b',
                address: 'b@b.com',
            },
        ])).toBe(true);
    });

    it('should return unseen status', () => {
        const wrapper = getShallowWapper(Mail, { searchid: 8 });

        wrapper.vm.mails = [
            {
                id: -1,
                unseen: true,
                subject: false,
                from: false,
            },
            {
                id: 1,
                unseen: false,
                subject: false,
                from: false,
            },
        ];
        expect(wrapper.vm.isUnseen(-1)).toBe(true);
        expect(wrapper.vm.isUnseen(0)).toBe(false);
        expect(wrapper.vm.isUnseen(1)).toBe(false);
        wrapper.vm.mails = [];
    });

    it('should return flagged status', () => {
        const wrapper = getShallowWapper(Mail, { searchid: 8 });

        wrapper.vm.mails = [
            {
                id: -1,
                flagged: true,
                subject: false,
                from: false,
            },
            {
                id: 1,
                flagged: false,
                subject: false,
                from: false,
            },
        ];
        expect(wrapper.vm.isFlagged(-1)).toBe(true);
        expect(wrapper.vm.isFlagged(0)).toBe(false);
        expect(wrapper.vm.isFlagged(1)).toBe(false);

        wrapper.vm.mails = [];
    });

    it('should return loading flag status', () => {
        const wrapper = getShallowWapper(Mail, { searchid: 8 });

        wrapper.vm.loadingFlag = [-1, 1];
        expect(wrapper.vm.isLoadingFlag(-1)).toBe(true);
        expect(wrapper.vm.isLoadingFlag(1)).toBe(true);
        expect(wrapper.vm.isLoadingFlag(2)).toBe(false);
    });

    it('should mark one mail as read', () => {
        const wrapper = getShallowWapper(Mail, { searchid: 8 });

        wrapper.vm.mails = [
            {
                id: -1,
                unseen: true,
                subject: false,
                from: false,
            },
            {
                id: 0,
                unseen: true,
                subject: false,
                from: false,
            },
            {
                id: 1,
                unseen: false,
                subject: false,
                from: false,
            },
        ];
        wrapper.vm.markAsRead(-1);

        expect(wrapper.vm.mails[0].unseen).toBe(false);
        expect(wrapper.vm.mails[1].unseen).toBe(true);
        expect(wrapper.vm.mails[2].unseen).toBe(false);

        wrapper.vm.mails = [];
    });

    it('should mark all as read', () => {
        const wrapper = getShallowWapper(Mail, { searchid: 8 });

        wrapper.vm.mails = [
            {
                id: -1,
                unseen: true,
                subject: false,
                from: false,
            },
            {
                id: 0,
                unseen: true,
                subject: false,
                from: false,
            },
            {
                id: 1,
                unseen: false,
                subject: false,
                from: false,
            },
        ];
        wrapper.vm.markAllAsRead();

        for (const mail of wrapper.vm.mails) {
            expect(mail.unseen).toBe(false);
        }

        wrapper.vm.mails = [];
    });

    it('should mark one mail as junk', () => {
        const wrapper = getShallowWapper(Mail, { searchid: 8 });

        wrapper.vm.mails = [
            {
                id: -1,
                subject: false,
                from: false,
            },
            {
                id: 0,
                subject: false,
                from: false,
            },
            {
                id: 1,
                subject: false,
                from: false,
            },
        ];
        wrapper.vm.markAsJunk(0);

        expect(wrapper.vm.mails.find((item) => item.id === -1)).toBeTruthy();
        expect(wrapper.vm.mails.find((item) => item.id === 0)).toBeUndefined();
        expect(wrapper.vm.mails.find((item) => item.id === 1)).toBeTruthy();
        expect(wrapper.vm.mails).toHaveLength(2);

        wrapper.vm.mails = [];
    });

    it('should not delete one mail', () => {
        const wrapper = getShallowWapper(Mail, { searchid: 8 });

        wrapper.vm.mails = [
            {
                id: -1,
                subject: false,
                from: false,
            },
            {
                id: 0,
                subject: false,
                from: false,
            },
            {
                id: 1,
                subject: false,
                from: false,
            },
        ];
        wrapper.vm.deleteMail(0);

        expect(wrapper.vm.mails.find((item) => item.id === -1)).toBeTruthy();
        expect(wrapper.vm.mails.find((item) => item.id === 0)).toBeTruthy();
        expect(wrapper.vm.mails.find((item) => item.id === 1)).toBeTruthy();
        expect(wrapper.vm.mails).toHaveLength(3);

        wrapper.vm.mails = [];
    });

    it('should delete one mail', () => {
        const wrapper = getShallowWapper(Mail, { searchid: 8 });

        wrapper.vm.mails = [
            {
                id: -1,
                subject: false,
                from: false,
            },
            {
                id: 0,
                subject: false,
                from: false,
            },
            {
                id: 1,
                subject: false,
                from: false,
            },
        ];
        wrapper.vm.beingDeletedId = 0;
        wrapper.vm.deleteMailConfirm();

        expect(wrapper.vm.mails.find((item) => item.id === -1)).toBeTruthy();
        expect(wrapper.vm.mails.find((item) => item.id === 0)).toBeUndefined();
        expect(wrapper.vm.mails.find((item) => item.id === 1)).toBeTruthy();
        expect(wrapper.vm.mails).toHaveLength(2);

        wrapper.vm.mails = [];
    });
});
