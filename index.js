const fs = require('fs');

class TransactionAnalyzer {
    constructor(transactions) {
        this.transactions = transactions;
    }

    // Добавляет новую транзакцию в массив транзакций
    addTransaction(transaction) {
        this.transactions.push(transaction);
    }

    // Возвращает массив всех транзакций
    getAllTransactions() {
        return this.transactions;
    }

    /**
     * Получает уникальные типы транзакций из списка транзакций.
     * @returns {Array<string>} Массив строк, содержащий уникальные типы транзакций.
     */
    getUniqueTransactionTypes() {
        const types = new Set();
        this.transactions.forEach(transaction => {
            types.add(transaction.transaction_type);
        });
        return Array.from(types);
    }


    /**
    * Вычисляет общую сумму транзакций.
    * @returns {number} Общая сумма всех транзакций.
    */
    calculateTotalAmount() {
        return this.transactions.reduce((total, transaction) => {
            return total + parseFloat(transaction.transaction_amount);
        }, 0);
    }


    /**
    * Вычисляет общую сумму транзакций за указанную дату.
    * @param {number} year - Год.
    * @param {number} month - Месяц (1-12).
    * @param {number} day - День месяца (1-31).
    * @returns {number} Общая сумма всех транзакций за указанную дату.
    */
    calculateTotalAmountByDate(year, month, day) {
        return this.transactions.reduce((total, transaction) => {
            const transactionDate = new Date(transaction.transaction_date);
            if (
                (!year || transactionDate.getFullYear() === year) &&
                (!month || transactionDate.getMonth() + 1 === month) &&
                (!day || transactionDate.getDate() === day)
            ) {
                total += parseFloat(transaction.transaction_amount);
            }
            return total;
        }, 0);
    }


    /**
     * Получает список транзакций по заданному типу.
     * @param {string} type - Тип транзакции для фильтрации.
     * @returns {Array<Object>} Массив объектов транзакций с указанным типом.
    */
    getTransactionsByType(type) {
        return this.transactions.filter(transaction => transaction.transaction_type === type);
    }


    /**
     * Получает список транзакций в заданном диапазоне дат.
     * @param {Date|string} startDate - Начальная дата диапазона.
     * @param {Date|string} endDate - Конечная дата диапазона.
     * @returns {Array<Object>} Массив объектов транзакций в указанном диапазоне дат.
     */
    getTransactionsInDateRange(startDate, endDate) {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.transaction_date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }


    /**
     * Получает список транзакций по имени торговца.
     * @param {string} merchantName - Имя торговца для фильтрации.
     * @returns {Array<Object>} Массив объектов транзакций с указанным именем торговца.
     */
    getTransactionsByMerchant(merchantName) {
        return this.transactions.filter(transaction => transaction.merchant_name === merchantName);
    }


    /**
     * Вычисляет среднюю сумму транзакции.
     * @returns {number} Средняя сумма транзакции.
     */
    calculateAverageTransactionAmount() {
        const totalAmount = this.calculateTotalAmount();
        return totalAmount / this.transactions.length;
    }


    // Возвращает транзакции с суммой в заданном диапазоне от minAmount до maxAmount
    getTransactionsByAmountRange(minAmount, maxAmount) {
        return this.transactions.filter(transaction => {
            const amount = parseFloat(transaction.transaction_amount);
            return amount >= minAmount && amount <= maxAmount;
        });
    }

    /**
     * Получает список транзакций в заданном диапазоне сумм.
     * @param {number} minAmount - Минимальная сумма транзакции.
     * @param {number} maxAmount - Максимальная сумма транзакции.
     * @returns {Array<Object>} Массив объектов транзакций в указанном диапазоне сумм.
     */
    getTransactionsByAmountRange(minAmount, maxAmount) {
        return this.transactions.filter(transaction => {
            const amount = parseFloat(transaction.transaction_amount);
            return amount >= minAmount && amount <= maxAmount;
        });
    }


    /**
     * Находит месяц с наибольшим количеством транзакций.
     * @returns {number} Номер месяца с наибольшим количеством транзакций (1-12).
     */
    findMostTransactionsMonth() {
        const months = new Array(12).fill(0);
        this.transactions.forEach(transaction => {
            const month = new Date(transaction.transaction_date).getMonth();
            months[month]++;
        });
        const maxTransactions = Math.max(...months);
        return months.indexOf(maxTransactions) + 1; // Adding 1 because months are zero-based
    }


    /**
     * Находит месяц с наибольшим количеством дебетовых транзакций.
     * @returns {number} Номер месяца с наибольшим количеством дебетовых транзакций (1-12).
     */
    findMostDebitTransactionMonth() {
        const debitTransactions = this.getTransactionsByType('debit');
        const months = new Array(12).fill(0);
        debitTransactions.forEach(transaction => {
            const month = new Date(transaction.transaction_date).getMonth();
            months[month]++;
        });
        const maxTransactions = Math.max(...months);
        return months.indexOf(maxTransactions) + 1; // Adding 1 because months are zero-based
    }


    /**
     * Определяет, какой тип транзакции (дебетовый, кредитовый или равное количество) встречается чаще.
     * @returns {string} Название типа транзакции, который встречается чаще: 'debit' (дебет), 'credit' (кредит) или 'equal' (равное количество).
     */
    mostTransactionTypes() {
        const debitCount = this.getTransactionsByType('debit').length;
        const creditCount = this.getTransactionsByType('credit').length;
        if (debitCount > creditCount) {
            return 'debit';
        } else if (debitCount < creditCount) {
            return 'credit';
        } else {
            return 'equal';
        }
    }


    /**
     * Получает список транзакций, совершенных до указанной даты.
     * @param {Date|string} date - Дата, до которой нужно получить транзакции.
     * @returns {Array<Object>} Массив объектов транзакций, совершенных до указанной даты.
     */
    getTransactionsBeforeDate(date) {
        date = new Date(date);
        return this.transactions.filter(transaction => {
            return new Date(transaction.transaction_date) < date;
        });
    }


    /**
     * Находит транзакцию по её идентификатору.
     * @param {string} id - Идентификатор транзакции для поиска.
     * @returns {Object|null} Объект транзакции, соответствующий указанному идентификатору, или null, если транзакция не найдена.
     */
    findTransactionById(id) {
        return this.transactions.find(transaction => transaction.transaction_id === id);
    }


    /**
     * Преобразует список транзакций в массив описаний транзакций.
     * @returns {Array<string>} Массив строк, содержащих описания транзакций.
     */
    mapTransactionDescriptions() {
        return this.transactions.map(transaction => transaction.transaction_description);
    }

}

// Считывание транзакций из JSON файла
const rawData = fs.readFileSync('transactions.json');
const transactions = JSON.parse(rawData);

// Создание процесса TransactionAnalyzer
const analyzer = new TransactionAnalyzer(transactions);