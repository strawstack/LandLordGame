(() => {

    // helpers
    function qs(selector) {
        return document.querySelector(selector);
    }
    function qsa(selector) {
        return document.querySelectorAll(selector);
    }

    function clickFact(state) {
        return (selector, fun) => {
            qs(selector).addEventListener("click", () => {
                fun(state);
                render(state);
            });
        };
    }

    function clickFact_all(state) {
        return (selector, fun) => {
            const elems = qsa(selector);
            elems.forEach((e, index) => {
                e.addEventListener("click", () => {
                    fun(state, index);
                    render(state);
                });
            });

        };
    }

    function setColor(elem, colorClassName) {
        let names = elem.className.split(" ");
        names = names.filter((x) => x !== "red" && x !== "green" && x !== "blue");
        names.push(colorClassName);
        elem.className = names.join(" ");
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
    const invest_gain = qs(".invest-gain");
    const loan_loss = qs(".loan-loss");
    
    // ref - UI state
    const promo_cost  = qs(".promo_cost span");
    const promo_count = qs(".promo_count");
    const invest_cost  = qsa(".invest-cost");
    const invest_count = qsa(".invest-count");
    const loan_value  = qsa(".loan-value");
    const work_value  = qs(".work-value span");

    // ref - UI elements
    const promo_row  = qs(".promo-row");
    const invest_row = qsa(".invest-row");
    const loan_row   = qsa(".loan-row");
    const loan_btn   = qsa(".loan-btn");
    const invest_sell_btn = qsa(".sell-area.invest");

    /*
    const salary = document.querySelector(".salary.display > span");
    const total_profits = document.querySelector(".total_profits.display > span");
    const investments = document.querySelector(".investments.display > span"); */

    function render(state) {
        
        // Map state to displays
        total_money.innerHTML = state.total_money;
        invest_gain.innerHTML = state.total_invest * state.data.invest_rate;
        loan_loss.innerHTML   = state.total_loan * state.data.loan_rate;

        // Set interface values
        promo_cost.innerHTML  = state.data.promo_cost[state.promo_index];
        promo_count.innerHTML = state.promo_index;
        work_value.innerHTML  = state.work_value;
        for (let i in state.data.invest_cost) {
            i = parseInt(i, 10);
            invest_cost[i].innerHTML = state.data.invest_cost[i];
            invest_count[i].innerHTML = state.invest_count[i];
        }
        for (let i in state.data.loan_value) {
            i = parseInt(i, 10);
            loan_value[i].innerHTML = state.data.loan_value[i];
            if (state.loan_state[i]) {
                loan_btn[i].innerHTML = "Pay";
                setColor(loan_btn[i].parentElement, "red");
            } else {
                loan_btn[i].innerHTML = "Get";
                setColor(loan_btn[i].parentElement, "green");
            }
        } 

        // Set active state of elements
        setActiveState(state);
        applyActiveState(state);
    }

    function setActiveState(state) {
        const next_promo_cost = state.data.promo_cost[state.promo_index];
        state.active.promo_row = next_promo_cost <= state.total_money;

        for (let i in state.data.invest_cost) {
            i = parseInt(i, 10);
            const invest_cost = state.data.invest_cost[i];
            state.active.invest_row[i] = invest_cost <= state.total_money;
            state.active.invest_sell_btn[i] = state.invest_count[i] > 0; 
        }

        for (let i in state.data.loan_value) {
            i = parseInt(i, 10);
            const loan_value = state.data.loan_value[i];
            state.active.loan_row[i] = loan_value <= state.total_invest * 10;
        }
    }

    function applyActiveState(state) {
        setActive(promo_row, state.active.promo_row);
        for (let i in state.data.invest_cost) {
            i = parseInt(i, 10);
            setActive(invest_row[i], state.active.invest_row[i]);
            setActive(invest_sell_btn[i], state.active.invest_sell_btn[i]);
        }
        for (let i in state.data.loan_value) {
            i = parseInt(i, 10);
            setActive(loan_row[i], state.active.loan_row[i]);
        }
    }

    function main() {
        
        // data
        const data = {
            promo_cost: [
                50,
                1000,
                5000
            ],
            invest_cost: [
                100,
                1000,
                5000
            ],
            loan_value: [
                1000,
                5000,
                9500
            ],
            invest_rate: 0.0016,
            loan_rate: 0.0032,
            renter_rate: 0.0032,
            prop_tax_rate: 0.0016,
            renter_time: 120,
            house_cost: [
                100,
                1000,
                5000,
                6000, 
                9900
            ],
            renter_click: [
                20,
                30,
                50,
                75,
                100
            ]
        }

        const state = {
            
            data: data,

            // work
            work_value: 50,

            // money
            total_money: 0,
            job_value: 0,

            // gains
            total_invest: 0,

            // loans
            total_loan: 0,

            // data index
            promo_index: 0,

            // counts
            invest_count: [0, 0, 0],
            loan_state: [false, false, false],
            agent: [false, false, false, false, false],
            renter_exists: [false, false, false, false, false],
            renter_time_left: [0, 0, 0, 0, 0],

            // UI state
            active: {
                promo_row: false,
                invest_row: [false, false, false],
                invest_sell_btn: [false, false, false],
                loan_row: [false, false, false],
            }
        };

        const click = clickFact(state);
        const click_all = clickFact_all(state); 

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

        click_all(".invest-btn", (state, index) => {
            if (state.active.invest_row[index]) {
                state.total_money -= state.data.invest_cost[index];
                state.invest_count[index] += 1;
                state.total_invest += state.data.invest_cost[index];
            }
        });

        click_all(".sell-area.invest", (state, index) => {
            if (state.active.invest_sell_btn[index]) {
                state.total_money += state.data.invest_cost[index];
                state.invest_count[index] -= 1;
                state.total_invest -= state.data.invest_cost[index];
            }
        });

        click_all(".loan-btn", (state, index) => {
            if (state.active.loan_row[index]) {

                // You have the loan
                if (state.loan_state[index]) {

                    // Can you afford to pay it off
                    if (state.total_money >= state.data.loan_value[index]) {
                        state.total_money -= state.data.loan_value[index];
                        state.total_loan -= state.data.loan_value[index];
                        state.loan_state[index] = false;
                    }

                } else { // You don't have the loan
                    state.total_money += state.data.loan_value[index];
                    state.total_loan += state.data.loan_value[index];
                    state.loan_state[index] = true;
                }
            }
        });

        render(state);
        setInterval(() => {
            const loan_loss = state.total_loan * state.data.loan_rate;
            state.total_money += state.total_invest * state.data.invest_rate - loan_loss;
            render(state);
        }, 1000);

    }

    main();

})();