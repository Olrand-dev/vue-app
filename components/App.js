const VERSION = '1.2';

/**
 * Когда нужно обновить данные базы для соответствия изменениям в коде,
 * нужно выставить PATCH_MODE в true, прописать нужные действия с базой
 * в методе App.patch, обновить страницу приложения - появится кнопка
 * patch внизу, после ее нажатия и сообщения 'patched' нажать кнопку 
 * сохранения базы, и выставить PATCH_MODE назад в false
 */
const PATCH_MODE = false;

Vue.use(Vuex);
Vue.use(VueToast);

const store = new Vuex.Store({

    state: {

        db: null,
        models: {},
        editing: {},
        showing: {},

        page: 1,
        itemsCount: 0,
        perPage: 6,
        offset: 0,
    },

    mutations: {

        setDb(state, db) {
            state.db = db;
        },

        saveDb(state, options) {
            App.saveDb(options);
        },

        initModels(state) {
            if (state.db !== null) {
                let models = state.models;

                models.orders = state.db.getCollection('orders');
                models.stores = state.db.getCollection('stores');
                models.customers = state.db.getCollection('customers');
            }
        },

        initDbCollections(state) {

            state.db.addCollection('orders');
            state.db.addCollection('stores');
            state.db.addCollection('customers');
        },

        setElementStatus(state, options) {
            let type = options.type;
            let prop = options.prop;
            let bool = options.bool;
            let toggle = options.toggle;

            if (!state[type].hasOwnProperty(prop)) {
                Vue.set(state[type], prop, bool);
            } else if (toggle) {
                Vue.set(state[type], prop, !state[type][prop]);
            } else {
                Vue.set(state[type], prop, bool);
            }
        },

        openImagesModal(state, options) {
            App.openImagesModal(options);
        },

        setPage(state, page) {
            state.page = page;
        },

        calculatePagenation(state) {
            state.offset = state.perPage * (state.page - 1);
        },

        setPerPage(state, value) {
            state.perPage = value;
        },


        /*-------- ORDERS --------*/

        addNewOrder(state, data) {
            state.models.orders.insert(data);
        },

        updateOrder(state, data) {
            state.models.orders.update(data);
        },

        deleteOrder(state, id) {
            let item = state.models.orders.findOne({'$loki': id});
            state.models.orders.remove(item);
        },


        /*-------- STORES --------*/

        addNewStore(state, data) {
            state.models.stores.insert(data);
        },

        updateStore(state, data) {
            state.models.stores.update(data);
        },

        deleteStore(state, id) {
            let item = state.models.stores.findOne({'$loki': id});
            state.models.stores.remove(item);
        },


        /*-------- CUSTOMERS --------*/

        addNewCustomer(state, data) {
            state.models.customers.insert(data);
        },

        updateCustomer(state, data) {
            state.models.customers.update(data);
        },

        deleteCustomer(state, id) {
            let item = state.models.customers.findOne({'$loki': id});
            state.models.customers.remove(item);
        }
    },

    getters: {

        getItemsList: state => modelAlias => {

            state.itemsCount = state.models[modelAlias].chain().data().length;

            return state.models[modelAlias].chain().
            offset(state.offset).
            limit(state.perPage).
            data();
        },

        getAllItemsList: state => modelAlias => {

            state.itemsCount = state.models[modelAlias].chain().data().length;
            return state.models[modelAlias].chain().data();
        },

        storesList(state) {
            return state.models.stores.chain().data();
        },

        customersList(state) {
            return state.models.customers.chain().data();
        },
    }
});

const routes = [
    { path: '/orders', component: OrdersList },
    { path: '/stores', component: StoresList },
    { path: '/customers', component: CustomersList },
];

const router = new VueRouter({
    routes
});

router.replace('/');
let timer = setInterval(() => {
    if (store.state.models.orders) {
        App.loaded = true;
        router.replace('/orders');
        clearInterval(timer);
    }  
}, 250);

const App = new Vue({

    el: '#app',

    store,
    router,

    components: [
        OrdersList,
        StoresList,
        CustomersList,
    ],

    data: {

        loaded: false,
        patchMode: PATCH_MODE,

        page: 1,
        perPage: 6,
        perPageOptions: [
            { value: 6, text: '6' },
            { value: 12, text: '12' },
            { value: 24, text: '24' },
        ],

        imagesList: [],
        imageCursor: 0,

        copyright: "&copy; Olrand's Web Workshop 2019. Arania App v" + VERSION,
    },

    created() {

        let db = new loki();

        $.ajax({
            url: 'api.php',
            type: 'GET',
            dataType: 'json',
            data: {
                action: 'getDbFile',
            },
            success: function(response) { 
                
                if (response.message === 'no db file') {

                    this.$store.commit('setDb', db);
                    this.$store.commit('initDbCollections');
                    infoToast('Створення бази даних...');

                    this.saveDb();

                } else {

                    db.loadJSON(response.data);
                    this.$store.commit('setDb', db);
                    this.$store.commit('initModels');
                }
            }.bind(this)
        });

        this.page = this.$store.state.page;
        this.perPage = this.$store.state.perPage;
    },

    computed: Vuex.mapState({

        itemsCount: state => state.itemsCount,
    
        imgUrl() {
            if (this.imagesList && this.imagesList.length > 0) {
                return this.imagesList[this.imageCursor];
            }
        }
    }),

    methods: {

        pagenate() {
            this.$store.commit('setPage', this.page);
            this.$store.commit('calculatePagenation');
        },

        setStorePerPage() {
            this.$store.commit('setPerPage', this.perPage);
        },

        openImagesModal(options) {
            this.imagesList = options.images;
            this.imageCursor = options.index;
            this.$refs['images-modal'].show();
        },

        prevImg() {
            this.imageCursor--;
            if (this.imageCursor < 0) this.imageCursor = this.imagesList.length - 1;
        },

        nextImg() {
            this.imageCursor++;
            if (this.imageCursor > this.imagesList.length - 1) this.imageCursor = 0;
        },

        saveDb(options) {
            let data = this.$store.state.db.serialize();
            let quiet = (hop(options, 'quiet')) ? options.quiet : false;

            $.ajax({
                url: 'api.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'saveDbFile',
                    db_data: data,
                },
                success: function(response) { 
    
                    if (response.status === 'error') {
                        errorToast('Помилка при збереженні бази даних.');
                        return;
                    }
                    if (!quiet) {
                        successToast('База даних успішно збережена.');
                    }
    
                }
            });
        },

        patch() {
            let orders = this.$store.getters.getAllItemsList('orders');

            for (let order in orders) {
                order = orders[order];
                order.status = ORDER_STATUS_OPEN;
                this.$store.commit('updateOrder', order);
            }

            successToast('patched');
        }
    }
});