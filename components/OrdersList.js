const ORDER_STATUS_OPEN = 'order_open';
const ORDER_STATUS_CLOSED = 'order_closed';

const ORDERS_SORT_TYPE_OPEN_FIRST = 'open_first';
const ORDERS_SORT_TYPE_CLOSED_FIRST = 'closed_first';

const ORDER_STATUS_SELECT = [
    {
        value: ORDER_STATUS_OPEN,
        text: 'В роботі', 
    },
    {
        value: ORDER_STATUS_CLOSED,
        text: 'Виконано', 
    },
];

const ORDERS_SORT_SELECT = [
    {
        value: ORDERS_SORT_TYPE_OPEN_FIRST,
        text: 'Спочатку в роботі', 
    },
    {
        value: ORDERS_SORT_TYPE_CLOSED_FIRST,
        text: 'Спочатку виконані', 
    },
];

const orderRef = {
    storeId: 0,
    status: ORDER_STATUS_OPEN,
    date: '',
    items: [],
    fullSum: 0,
    fullStoreDeliverySum: 0,
    fullCarrierDeliverySum: 0,
    fullWeight: 0,
};

const orderItemRef = {
    customerId: 0,
    orderId: 0,
    date: '',
    sum: 0,
    storeDeliverySum: 0,
    carrierDeliverySum: 0,
    weight: 0,
    images: [],
};

const OrdersList = Vue.component('orders-list', {

    data() {
        return {

            order: clone(orderRef),
            orderItem: clone(orderItemRef),

            storeOptions: [{value: 0, text: 'Оберіть магазин зі списку...'}],
            customerOptions: [{value: 0, text: 'Оберіть клієнта зі списку...'}],
            orderStatusOptions: ORDER_STATUS_SELECT,
            
            ordersSortOptions: ORDERS_SORT_SELECT,
            sortType: ORDERS_SORT_TYPE_OPEN_FIRST,

            //editStack: [],

            uploading: false,
            uploadStatus: 'завантаження файлів...',
            uploadStatusTextClass: 'text-muted',
            uploadStatusIconClass: 'fa-spinner anim-rotate',
        }
    },

    computed: {

        ordersList() {
            let list = this.$store.getters.getAllItemsList('orders');

            switch (this.sortType) {
                case ORDERS_SORT_TYPE_OPEN_FIRST: {

                    function compare(a, b) {
                        let comparison = 0;

                        if (a.status === ORDER_STATUS_OPEN) {
                          comparison = -1;
                        } else if (b.status === ORDER_STATUS_OPEN) {
                          comparison = 1;
                        }
                        return comparison;
                    }
                    break;
                }
                case ORDERS_SORT_TYPE_CLOSED_FIRST: {

                    function compare(a, b) {
                        let comparison = 0;

                        if (a.status === ORDER_STATUS_CLOSED) {
                          comparison = -1;
                        } else if (b.status === ORDER_STATUS_CLOSED) {
                          comparison = 1;
                        }
                        return comparison;
                    }
                    break;
                }
            }
            list.sort(compare);
            let from = this.$store.state.offset;
            let to = this.$store.state.offset + this.$store.state.perPage;
            list = list.slice(from, to);

            this.prepareOrderItemsStatus(list);
            return this.prepareDynamicOrdersData(list);
        },

        storesList() {
            return this.$store.getters.storesList;
        },

        customersList() {
            return this.$store.getters.customersList;
        },
    },

    created() {

        this.updateOrderItemImagesStatus();

        this.prepareStoreOptionsList();
        this.prepareCustomerOptionsList();
    },

    methods: {

        prepareDynamicOrdersData(list) {
            list.forEach(order => {

                for (let store in this.storesList) {
                    store = this.storesList[store];
                    if (store.$loki === order.storeId) {
                        order.storeName = store.name;
                        break;
                    }
                }

                order.items.forEach(orderItem => {
                    for (let customer in this.customersList) {
                        customer = this.customersList[customer];
                        if (customer.$loki === orderItem.customerId) {
                            orderItem.customerName = customer.name;
                            break;
                        }
                    }
                });
            });
            return list;
        },

        prepareOrderItemsStatus(list) {
            list.forEach(order => {
                order.items.forEach(item => {
                    let prop = 'order-' + order.$loki + '-item-' + item.customerId;

                    this.$store.commit('setElementStatus', {
                        type: 'editing',
                        prop,
                        bool: false,
                        toggle: false,
                    });
                });
            });
        },

        updateOrderItemImagesStatus() {
            this.ordersList.forEach(order => {
                order.items.forEach(item => {
                    let datetimes = [];

                    item.images.forEach(imagePath => {
                        let date = imagePath.split('/').slice(-1)[0].split('.')[0].split('_')[0];
                        let dateParts = date.split('-');
                        datetimes.push(
                            `${dateParts[0]}-${dateParts[1]}-${dateParts[2]} ${dateParts[3]}:${dateParts[4]}:${dateParts[5]}`
                        );
                    });
                    item.datetimes = datetimes;
                });
            });
        },

        prepareStoreOptionsList() {
            for (let store in this.storesList) {
                store = this.storesList[store];
                this.storeOptions.push({value: store.$loki, text: store.name});
            }
        },

        prepareCustomerOptionsList() {
            for (let customer in this.customersList) {
                customer = this.customersList[customer];
                this.customerOptions.push({value: customer.$loki, text: customer.name});
            }
        },

        openOrderSettings() {
            this.$store.commit('setElementStatus', {
                type: 'showing',
                prop: 'order-settings',
                bool: true,
                toggle: false,
            });
        },

        openOrderItemSettings(orderId) {
            let prop = 'order-' + orderId + '-item-settings';

            this.$store.commit('setElementStatus', {
                type: 'showing',
                prop,
                bool: true,
                toggle: false,
            }); console.log(this.$store.state.showing);
        },

        openOrderItemImageSettings(orderId, customerId) {
            let prop = 'order-' + orderId + '-item-' + customerId + '-image-settings';

            this.$store.commit('setElementStatus', {
                type: 'showing',
                prop,
                bool: true,
                toggle: false,
            });
        },

        closeOrderItemImageSettings(orderId, customerId) {
            let prop = 'order-' + orderId + '-item-' + customerId + '-image-settings';

            this.$store.commit('setElementStatus', {
                type: 'showing',
                prop,
                bool: false,
                toggle: false,
            });
        },

        toogleOrderStatistics(orderId) {
            let prop = 'order-' + orderId + '-statistics';

            this.$store.commit('setElementStatus', {
                type: 'showing',
                prop,
                bool: true,
                toggle: true,
            });
        },

        openImagesModal(images, index) {

            this.$store.commit('openImagesModal', {
                images,
                index
            });
        },

        orderSettingsShowOn() {
            return this.$store.state.showing['order-settings'] === true;
        },

        orderItemSettingsShowOn(orderId) {
            let prop = 'order-' + orderId + '-item-settings';
            return this.$store.state.showing[prop] === true;
        },

        orderStatisticsShowOn(orderId) {
            let prop = 'order-' + orderId + '-statistics';
            return this.$store.state.showing[prop] === true;
        },

        orderItemImageSettingsShowOn(orderId, customerId) {
            let prop = 'order-' + orderId + '-item-' + customerId + '-image-settings';
            return this.$store.state.showing[prop] === true;
        },

        orderItemEditOn(orderId, customerId) {
            let prop = 'order-' + orderId + '-item-' + customerId;
            return this.$store.state.editing[prop] === true;
        },

        orderItemEditOff(orderId, customerId) {
            let prop = 'order-' + orderId + '-item-' + customerId;
            return this.$store.state.editing[prop] === false;
        },

        close(alias) {
            this.$store.commit('setElementStatus', {
                type: 'showing',
                prop: alias,
                bool: false,
                toggle: false,
            });
        },

        /**
         * @param {Number} orderId 
         */
        findOrder(orderId) {
            return this.ordersList.find(order => order.$loki === orderId);
        },

        /**
         * @param {Number} orderId 
         * @param {Number} customerId 
         */
        findOrderItem(orderId, customerId) {
            let order = this.findOrder(orderId);
            return order.items.find(
                item => item.customerId === customerId && item.orderId === orderId
            );
        },

        addOrder() {
            if (this.order.storeId === 0) {
                errorToast('Необхідно обрати магазин.');
                return;
            }

            this.close('order-settings');
            this.order.date = getCurrentDateTime();

            this.$store.commit('addNewOrder', this.order);
            this.order = clone(orderRef);
            successToast('Замовлення додано.');
        },

        addOrderItem(orderId) {
            if (this.orderItem.customerId === 0) {
                errorToast('Необхідно обрати клієнта.');
                return;
            }

            let order = this.findOrder(orderId);
            let error = false;

            order.items.forEach(item => {
                if (item.customerId === this.orderItem.customerId) {
                    errorToast('Даний клієнт вже доданий до замовлення.');
                    error = true;
                }
            });
            if (error) return;

            this.orderItem.date = getCurrentDateTime();
            this.orderItem.orderId = orderId;

            order.items.push(clone(this.orderItem));

            this.orderItem = clone(orderItemRef);
            this.close('order-' + orderId + '-item-settings');

            successToast('Клієнта до замовлення додано.');
        },

        editOrderItem(orderId, customerId) {
            let prop = 'order-' + orderId + '-item-' + customerId;

            this.$store.commit('setElementStatus', {
                type: 'editing',
                prop,
                bool: true,
                toggle: false,
            });
        },

        sendImageFiles(orderId, customerId) {

            let inputName = orderId + '-' + customerId + '-image-files';
            if ($('input[name="' + inputName + '"]')[0].files.length === 0) {
                infoToast('Виберіть файл(и) для завантаження.');
                return;
            }

            this.uploading = true;
        
            let data = new FormData();
            $.each($('input[name="' + inputName + '"]')[0].files, function(i, file) {
                data.append('files[]', file);
            });

            $.ajax({
                url: 'api.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'setSessionValues',
                    values: {
                        order_id: orderId,
                        customer_id: customerId,
                    },
                },
                success: function() { 
    
                    $.ajax({
                        url: 'api.php',
                        data: data,
                        cache: false,
                        contentType: false,
                        processData: false,
                        method: 'POST',
                        success: function(response) {
                            
                            response = JSON.parse(response);
                            
                            if (response.status === 'error') {
                                this.uploadStatus = 'помилка завантаження';
                                this.uploadStatusIconClass = 'fa-times';
                                this.uploadStatusTextClass = 'text-red';
                                errorToast('Помилка під час завантаження файла(ів).');
                                return;
                            }
                
                            this.uploadStatus = 'успішно завантажено';
                            this.uploadStatusIconClass = 'fa-check';
                            this.uploadStatusTextClass = 'text-green';
                            successToast('Файл(и) успішно завантажено.');

                            let order = this.findOrder(orderId);
                            let orderItem = this.findOrderItem(orderId, customerId);

                            orderItem.images = orderItem.images.concat(response.data);
                            this.$store.commit('updateOrder', order);
                            this.$store.commit('saveDb', { quiet: true });
                            this.updateOrderItemImagesStatus();
        
                            setTimeout(function() {
                                this.uploading = false;
                            }.bind(this), 5000);
                
                        }.bind(this)
                    });
    
                }.bind(this)
            });
        },

        saveOrderItem(orderId, customerId) {
            let prop = 'order-' + orderId + '-item-' + customerId;

            this.$store.commit('setElementStatus', {
                type: 'editing',
                prop,
                bool: false,
                toggle: false,
            });
            this.calculateOrder(orderId);
        },

        calculateOrder(orderId) {
            let order = this.findOrder(orderId);
            order.fullSum = 0;
            order.fullStoreDeliverySum = 0;
            order.fullCarrierDeliverySum = 0;
            order.fullWeight = 0;

            order.items.forEach(item => {
                order.fullSum += parseFloat(item.sum);
                order.fullStoreDeliverySum += parseFloat(item.storeDeliverySum);
                order.fullCarrierDeliverySum += parseFloat(item.carrierDeliverySum);
                order.fullWeight += parseFloat(item.weight);
            });

            order.fullSum = _round(order.fullSum, 2);
            order.fullStoreDeliverySum = _round(order.fullStoreDeliverySum, 2);
            order.fullCarrierDeliverySum = _round(order.fullCarrierDeliverySum, 2);
            order.fullWeight = _round(order.fullWeight / 1000, 2);
        },

        deleteOrder(orderId) {
            if (!confirm('Замовлення і всі його дані будуть видалені, продовжити?')) return;

            $.ajax({
                url: 'api.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'deleteOrderImagesFolder',
                    order_id: orderId,
                },
                success: function() {
                    
                    this.$store.commit('deleteOrder', orderId);
                    infoToast('Замовлення видалено.');
        
                }.bind(this)
            });
        },

        deleteOrderItem(orderId, customerId) {
            if (!confirm('Клієнт буде видалений з замовлення, продовжити?')) return;

            $.ajax({
                url: 'api.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'deleteOrderItemImagesFolder',
                    order_id: orderId,
                    customer_id: customerId,
                },
                success: function() {
                    
                    let order = this.findOrder(orderId);
                    order.items = order.items.filter(item => item.customerId !== customerId);
                    infoToast('Клієнта з замовлення видалено.');
        
                }.bind(this)
            });
        },

        deleteOrderItemImage(orderId, customerId, imgPath) {
            $.ajax({
                url: 'api.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    action: 'deleteOrderItemImage',
                    img_path: imgPath,
                },
                success: function(response) {
                    
                    if (response.status === 'error') {
                        errorToast('Помилка під час видалення файла.');
                        return;
                    }

                    let order = this.findOrder(orderId);
                    let orderItem = this.findOrderItem(orderId, customerId);
                    orderItem.images = orderItem.images.filter(image => image !== imgPath);

                    infoToast('Скріншот видалено.');
                    successToast('Файл успішно видалено.');

                    this.$store.commit('updateOrder', order);
                    this.$store.commit('saveDb', { quiet: true });
        
                }.bind(this)
            });
        }
    },

    template: '#orders-list-template'
});