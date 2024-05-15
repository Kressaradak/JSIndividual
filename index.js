// index.js

const fs = require('fs');

class Transaction {
    constructor(id, date, amount, type, description, merchant, cardType) {
        this.id = id;
        this.date = date;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.merchant = merchant;
        this.cardType = cardType;
    }

    string() {
        return JSON.stringify({
            transaction_id: this.id,
            transaction_date: this.date,
            transaction_amount: this.amount,
            transaction_type: this.type,
            transaction_description: this.description,
            merchant_name: this.merchant,
            card_type: this.cardType
        });
    }
}

class TransactionAnalyzer {
    constructor(transactions) {
        this.transactions = transactions.map(t =>
            new Transaction(t.transaction_id, t.transaction_date, t.transaction_amount, t.transaction_type, t.transaction_description, t.merchant_name, t.card_type)
        );
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
    }

    getAllTransactions() {
        return this.transactions;
    }

    getUniqueTransactionTypes() {
        const types = new Set(this.transactions.map(t => t.type));
        return Array.from(types);
    }

    calculateTotalAmount() {
        return this.transactions.reduce((total, t) => total + t.amount, 0);
    }

    calculateTotalAmountByDate(year, month, day) {
        const filteredTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            if (year && transactionDate.getFullYear() !== year) return false;
            if (month && transactionDate.getMonth() + 1 !== month) return false;
            if (day && transactionDate.getDate() !== day) return false;
            return true;
        });
        return filteredTransactions.reduce((total, t) => total + t.amount, 0);
    }

    getTransactionsByType(type) {
        return this.transactions.filter(t => t.type === type);
    }

    getTransactionsInDateRange(startDate, endDate) {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        return this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }

    getTransactionsByMerchant(merchantName) {
        return this.transactions.filter(t => t.merchant === merchantName);
    }

    calculateAverageTransactionAmount() {
        const totalAmount = this.calculateTotalAmount();
        return totalAmount / this.transactions.length;
    }

    getTransactionsByAmountRange(minAmount, maxAmount) {
        return this.transactions.filter(t => t.amount >= minAmount && t.amount <= maxAmount);
    }

    calculateTotalDebitAmount() {
        const debitTransactions = this.getTransactionsByType('debit');
        return debitTransactions.reduce((total, t) => total + t.amount, 0);
    }

    findMostTransactionsMonth() {
        const months = {};
        this.transactions.forEach(t => {
            const month = new Date(t.date).getMonth() + 1;
            months[month] = (months[month] || 0) + 1;
        });
        return Object.keys(months).reduce((a, b) => months[a] > months[b] ? parseInt(a) : parseInt(b));
    }

    findMostDebitTransactionMonth() {
        const debitTransactions = this.getTransactionsByType('debit');
        const months = {};
        debitTransactions.forEach(t => {
            const month = new Date(t.date).getMonth() + 1;
            months[month] = (months[month] || 0) + 1;
        });
        return Object.keys(months).reduce((a, b) => months[a] > months[b] ? parseInt(a) : parseInt(b));
    }

    mostTransactionTypes() {
        const debitCount = this.getTransactionsByType('debit').length;
        const creditCount = this.getTransactionsByType('credit').length;
        if (debitCount > creditCount) return 'debit';
        if (creditCount > debitCount) return 'credit';
        return 'equal';
    }

    getTransactionsBeforeDate(date) {
        const cutoffDate = new Date(date);
        return this.transactions.filter(t => new Date(t.date) < cutoffDate);
    }

    findTransactionById(id) {
        return this.transactions.find(t => t.id === id);
    }

    mapTransactionDescriptions() {
        return this.transactions.map(t => t.description);
    }
}

const transactionsData = JSON.parse(fs.readFileSync('transactions.json', 'utf8'));

const analyzer = new TransactionAnalyzer(transactionsData);

//Использование программы
console.log("Уникальные типы транзакций:", analyzer.getUniqueTransactionTypes());
console.log("Общая сумма:", analyzer.calculateTotalAmount());
console.log("Общая сумма за январь 2019 года:", analyzer.calculateTotalAmountByDate(2019, 1));
console.log("Дебетовые транзакции:", analyzer.getTransactionsByType('debit'));
console.log("Транзакции в диапазоне дат:", analyzer.getTransactionsInDateRange('2019-01-01', '2019-01-02'));
console.log("Средняя сумма транзакции:", analyzer.calculateAverageTransactionAmount());
console.log("Общая сумма дебетовых транзакций:", analyzer.calculateTotalDebitAmount());
console.log("Месяц с наибольшим количеством транзакций:", analyzer.findMostTransactionsMonth());
console.log("Месяц с наибольшим количеством дебетовых транзакций:", analyzer.findMostDebitTransactionMonth());
console.log("Самые часто встречающиеся типы транзакций:", analyzer.mostTransactionTypes());
console.log("Транзакции до 1 января 2019 года:", analyzer.getTransactionsBeforeDate('2019-01-01'));
console.log("Транзакция с ID 2:", analyzer.findTransactionById('2'));
console.log("Описания транзакций:", analyzer.mapTransactionDescriptions());
