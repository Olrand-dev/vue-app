const customerRef = {
    name: 'Новий клієнт',
    address: '',
    phone: '',
    email: '',
    comment: '',
    socialLinks: '',
};

const CustomersList = Vue.component('customers-list', {

    data() {
        return {

        }
    },

    computed: {

        customersList() {
            let list = this.$store.getters.getItemsList('customers');

            list.forEach(customer => {
                let prop = 'customer-' + customer.$loki;
    
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
        },
    },

    methods: {

        addCustomer() {
            this.$store.commit('addNewCustomer', clone(customerRef));
            successToast('Клієнта додано.');
        },

        toggleShowInfo(customerId) {
            let prop = 'customer-' + customerId;

            this.$store.commit('setElementStatus', {
                type: 'showing',
                prop,
                bool: true,
                toggle: true,
            });
        },

        showingOn(customerId) {
            return this.$store.state.showing['customer-' + customerId] === true;
        },

        editCustomer(customerId) {
            let prop = 'customer-' + customerId;

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

        editingOn(customerId) {
            return this.$store.state.editing['customer-' + customerId] === true;
        },

        editingOff(customerId) {
            return this.$store.state.editing['customer-' + customerId] === false;
        },

        getCustomerData(customerId) {
            return this.customersList.find(customer => customer.$loki === customerId);
        },

        saveCustomer(customerId) {
            let prop = 'customer-' + customerId;

            this.$store.commit('setElementStatus', {
                type: 'editing',
                prop,
                bool: false,
                toggle: false,
            });

            let customerData = this.getCustomerData(customerId);
            this.$store.commit('updateCustomer', customerData);
            this.$store.commit('updateOrderCustomerNames', customerData.name);
        },

        deleteCustomer(customerId) {
            if (!confirm('Дані клієнта будуть видалені, продовжити?')) return;
            this.$store.commit('deleteCustomer', customerId);
            infoToast('Клієнта видалено.');
        }
    },

    template: '#customers-list-template'
});