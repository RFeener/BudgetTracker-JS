/////////////////////
//Budget Controller//
/////////////////////
//Controls budget Objects and Functions
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercent = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
        Expense.prototype.getPercent = function () {
            return this.percentage;
        }
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.dataItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    //////////////////
    //Data Structure//
    //////////////////
    var data = {
        dataItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percent: -1
    };

    return {
        addItem: function (type, des, val) {
            var item, ID;

            //Create new ID
            if (data.dataItems[type].length > 0) {
                ID = data.dataItems[type][data.dataItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new Object based on type
            if (type === 'exp') {
                item = new Expense(ID, des, val);
            } else if (type == 'inc') {
                item = new Income(ID, des, val);
            }
            ID++;

            //push to controller
            data.dataItems[type].push(item);
            return item;
        },
        deleteItem: function (type, id) {
            var index, idArray;
            //get id to be removed
            //map works similar to for foreach except map returns brand new array

            idArray = data.dataItems[type].map(function (current) {
                return current.id;
            });
            console.log(idArray);
            console.log('ID to Remove' + id);
            index = idArray.indexOf(id);
            console.log(index);
            if (index != -1) {
                data.dataItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {
            calculateTotal('inc');
            calculateTotal('exp');
            //Calculate Budget -> total Income and Expenses
            data.budget = data.totals.inc - data.totals.exp;
            //Calculate Percenatge of income spent
            if (data.totals.inc > 0) {
                data.percent = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percent = -1;
            }
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percent
            };
        },
        calculatePercentages: function () {
            //ForEach is best when you are looping over an array while performing a task
            data.dataItems.exp.forEach(function (current) {
                current.calcPercent(data.totals.inc);
            });
        },
        getPercentages: function () {
            //Map method is best used for storing an array   
            var allPercentages = data.dataItems.exp.map(function (current) {
                return current.getPercent();
            });
            return allPercentages;
        },
        testing: function () {
            console.log(data);
        }
    };
})();
/////////////////
//UI CONTROLLER//
/////////////////
//controls the User interface and DOM
var UIController = (function () {

    //Object consisting of different classes for DOM manipulations
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBTN: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        totalPercentageLabel: '.budget__expenses--percentage',
        expensePercentageLabel: '.item__percentage',
        container: '.container',
        monthLabel: '.budget__title--month'
    };
    // Method to format number to Currency
    var formatNumber = function (num, type) {
        num = Math.abs(num);
        num = num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        if (type == 'exp') {
            return '- $' + num;
        } else {
            return '+ $' + num;

        }
    };

    //Since nodeLists do not have a for each method, this is a work around for one
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    //Public Methods//
    return {
        getinput: function () {
            return {
                //Type will ethier be inc for income or exp for expense
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        getDOMstrings: function () {
            return DOMstrings;
        },
        addListItem: function (obj, type) {
            var html, newHTML, element;

            //Create HTML string with placehold text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem: function (selectedID) {
            //Retrives the element based on ID
            var deletedElement = document.getElementById(selectedID);
            //moves up to the parent node and removes the child.
            deletedElement.parentNode.removeChild(deletedElement);
        },
        displayMonth: function () {
            var now = new Date();
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            document.querySelector(DOMstrings.monthLabel).textContent = months[now.getMonth()] + ' ' + now.getUTCFullYear();
        },
        displayBudget: function (obj) {
            var type;
            if (obj.budget > 0) {
                type = 'inc';
            } else {
                type = 'exp';
            }

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
            document.querySelector(DOMstrings.totalPercentageLabel).textContent = "% " + obj.percentage;
        },
        displayPercentage: function (percentages) {
            var nodeList = document.querySelectorAll(DOMstrings.expensePercentageLabel);

            //Calling the nodeListForEach method
            nodeListForEach(nodeList, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = '%' + percentages[index];
                } else {
                    current.textContent = '---';
                }
            });
        },
        clearInputFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
                fieldsArr[0].focus();
            });
        },
        changeType: function () {
            var nodeList = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
            );
            nodeListForEach(nodeList, function (current) {
                current.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBTN).classList.toggle('red');
        }
    }; //END OF PUBLIC METHODS
})();
/////////////////////////
//GLOBAL APP CONTROLLER//
/////////////////////////
//Controls Events and Other Controllers functions//
var controller = (function (budgetCTRL, UICTRL) {
    var DOM = UICTRL.getDOMstrings();
    // Event Listeners
    var setupEL = function () {
        document.querySelector(DOM.inputBTN).addEventListener('click', ctrlAddItem);
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICTRL.changeType);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

    };
    // End Of Event Listeners

    var updateMonth = function () {
        UICTRL.displayMonth();
    };
    var updateBudget = function (type) {

        //calculate budget
        budgetCTRL.calculateBudget();

        //return budget
        var budget = budgetCTRL.getBudget();

        //Display
        UICTRL.displayBudget(budget, type);

    };
    var updatePercentages = function () {
        //Calculate Percantages
        budgetCTRL.calculatePercentages();

        //Get Percentages from Budget Controller
        var percentages = budgetCTRL.getPercentages();

        //Update the UI with percentages
        UICTRL.displayPercentage(percentages);
    }


    var ctrlAddItem = function () {
        var input, newItem;

        //Get input data
        input = UICTRL.getinput();
        if (input.description != "" && !isNaN(input.value) && input.value > 0) {

            //Add item to Budget controller
            newItem = budgetCTRL.addItem(input.type, input.description, input.value);

            //Add item to UI
            UICTRL.addListItem(newItem, input.type);

            //Clear Input Fields
            UICTRL.clearInputFields();

            //Calculate Budget and Display Budget on UI
            updateBudget();

            //Calculate and Update Percentages
            updatePercentages();
        }
    };
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, id;

        // Grab Item user clicks to delete
        // uses 4 parentNodes in order to Move up 4 divs and grab ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            //Delete item from Data struture
            budgetCTRL.deleteItem(type, ID);
            //Delete item from UI
            UICTRL.deleteListItem(itemID);
            //Update Budget
            updateBudget();
            //Calculate and Update Percentages
            updatePercentages();
        }


    };
    //Public Initialization Function
    //Everything inside this return runs at Startup
    return {
        init: function () {
            console.log('Application has started.');
            updateMonth();
            setupEL();
        }
    }

})(budgetController, UIController);

//This line is EXTREMELY important-> without it, none of the event listeners will start rendering the application useless
controller.init();