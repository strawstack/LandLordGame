(() => {

    function sum_list(lst) {
        let total = 0;
        for (let x of lst) {
            total += x;
        }
        return total;
    }

    /*
    const total_money = document.querySelector(".total_money.display > span");
    const salary = document.querySelector(".salary.display > span");
    const total_profits = document.querySelector(".total_profits.display > span");
    const investments = document.querySelector(".investments.display > span"); */

    function render(state) {
        
        // Map state to displays
        /*
        salary.innerHTML = state.salary;
        investments.innerHTML = state.investments;
        total_profits.innerHTML = state.salary;
        total_money.innerHTML = state.total_money; */
        
        // Show/hide stuff accordingly
    }

    function main() {
        const state = {
            salary: 0,
            investments: 0,
            wages: 0,
            property_tax: 0,
            total_spending: 0,
            total_income: 0,
            total_money: 0,

            jobs: [],
        };

        /*
        document.querySelector(".sell_art.btn").addEventListener("click", () => {
            state.total_money += 1;
            render(state);
        }); */

        /*
        setInterval(() => {
            state.total_money += state.salary + state.investments;
            render(state);
        }, 1000); */

    }

    main();

})();