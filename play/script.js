(() => {

    // helpers
    function qs(selector) {
        return document.querySelector(selector);
    }

    function clickFact(state) {
        return (selector, fun) => {
            qs(selector).addEventListener("click", () => {
                fun(state);
                render(state);
            });
        };
    }

    function setActive(elem, state) {
        let names = elem.className.split(" ");
        names = names.filter((x) => x !== "deactive");
        if (state == false) {
            names.push("deactive");
        }
        elem.className = names.join(" ");
    }

    // ref - displays
    const total_money = qs(".money-area span");
    const job_value   = qs(".job-value");
    
    // ref - UI state
    const promo_cost  = qs(".promo_cost span");
    const promo_count = qs(".promo_count");
    const work_value  = qs(".work-value span");

    // ref - UI elements
    const promo_row = qs(".promo-row");

    /*
    const salary = document.querySelector(".salary.display > span");
    const total_profits = document.querySelector(".total_profits.display > span");
    const investments = document.querySelector(".investments.display > span"); */

    function render(state) {
        
        // Map state to displays
        total_money.innerHTML = state.total_money;
        job_value.innerHTML = state.job_value;

        // Set interface values
        promo_cost.innerHTML  = state.data.promo_cost[state.promo_index];
        promo_count.innerHTML = state.promo_index;
        work_value.innerHTML  = state.work_value;
        
        // Set active state of elements
        setActiveState(state);
        applyActiveState(state);
    }

    function setActiveState(state) {
        const next_promo_cost = state.data.promo_cost[state.promo_index];
        state.active.promo_row = next_promo_cost <= state.total_money; 
    }

    function applyActiveState(state) {
        setActive(promo_row, state.active.promo_row);
    }

    function main() {
        
        // data
        const data = {
            promo_cost: [
                50,
                1000,
                5000
            ],
        }

        const state = {
            
            data: data,

            // work
            work_value: 1,

            // money
            total_money: 0,
            job_value: 0,

            // gains
            investments: 0,

            // loans

            // data index
            promo_index: 0,

            // UI state
            active: {
                promo_row: false
            }
        };

        const click = clickFact(state); 

        click(".work-btn", (state) => {
            state.total_money += state.work_value;
            state.job_value += state.work_value;
        });

        click(".promo-btn", (state) => {
            if (state.active.promo_row) {
                state.total_money -= state.data.promo_cost[state.promo_index];
                state.promo_index += 1;
                state.work_value = Math.pow(2, state.promo_index);
            }
        });

        render(state);
        setInterval(() => {
            state.total_money += state.investments;
            render(state);
        }, 1000);

    }

    main();

})();