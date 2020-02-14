const storeRef = {
    name: 'Новий магазин',
    url: '',
    comment: '',
};

const StoresList = Vue.component('stores-list', {

    data() {
        return {

            editingStores: {},
            showingStoresInfo: {},
        }
    },

    computed: {

        storesList() {
            let list = this.$store.getters.getItemsList('stores');

            list.forEach(store => {
                let prop = 'store-' + store.$loki;
    
                this.$store.commit('setElementStatus', {
                    type: 'editing',
                    prop,
                    bool: false,
                    toggle: false,
                });
                this.$store.commit('setElementStatus', {
                    type: 'showing',
                    prop,
                    bool: false,
                    toggle: false,
                });
            });
            return list;
        }
    },

    methods: {

        addStore() {
            this.$store.commit('addNewStore', clone(storeRef));
            successToast('Магазин додано.');
        },

        toggleShowInfo(storeId) {
            let prop = 'store-' + storeId;

            this.$store.commit('setElementStatus', {
                type: 'showing',
                prop,
                bool: true,
                toggle: true,
            });
        },

        showingOn(storeId) {
            return this.$store.state.showing['store-' + storeId] === true;
        },

        editStore(storeId) {
            let prop = 'store-' + storeId;

            this.$store.commit('setElementStatus', {
                type: 'editing',
                prop,
                bool: true,
                toggle: false,
            });
            this.$store.commit('setElementStatus', {
                type: 'showing',
                prop,
                bool: false,
                toggle: false,
            });
        },

        editingOn(storeId) {
            return this.$store.state.editing['store-' + storeId] === true;
        },

        editingOff(storeId) {
            return this.$store.state.editing['store-' + storeId] === false;
        },

        getStoreData(storeId) {
            return this.storesList.find(store => store.$loki === storeId);
        },

        saveStore(storeId) {
            let prop = 'store-' + storeId;

            this.$store.commit('setElementStatus', {
                type: 'editing',
                prop,
                bool: false,
                toggle: false,
            });

            let storeData = this.getStoreData(storeId);
            this.$store.commit('updateStore', storeData);
            this.$store.commit('updateOrderStoreNames', storeData.name);
        },

        deleteStore(storeId) {
            if (!confirm('Дані магазину будуть видалені, продовжити?')) return;
            this.$store.commit('deleteStore', storeId);
            infoToast('Магазин видалено.');
        }
    },

    template: '#stores-list-template'
});