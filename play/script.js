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

    function calcHouseNet(state) {
        let house_net = 0;
        for (let i in state.data.house_value) {
            i = parseInt(i, 10);
            const houseValue = state.house_count[i] * state.data.house_value[i];
            house_net -= houseValue * state.data.prop_tax_rate;
            if (state.renter_exists[i] || state.agent[i]) {
                house_net += houseValue * state.data.renter_rate;
            }
            if (state.agent[i]) {
                house_net -= calcAgentCost(state, i);
            }
        }
        return house_net;
    }

    function calcAgentCost(state, i) {
        return Math.ceil(
            state.data.house_value[i] * state.data.agent_cost
        );
    }

    function calcPromoCost(promoIndex) {
        return (50 + promoIndex * 10) * Math.pow(2, promoIndex);
    }

    function calcMoneyChange(state) {
        const house_net = calcHouseNet(state);
        const invest_gain = state.total_invest * state.data.invest_rate;
        const loan_loss  = state.total_loan * state.data.loan_rate;
        return house_net + invest_gain - loan_loss; 
    }

    // display number
    function dn(number) {
        const roundNumber = Math.floor(number * 100) / 100;
        const ONE_THOUSAND = 1000;
        const ONE_MILLION  = 1000000;
        const ONE_BILLION  = 1000000000;
        const ONE_TRILLION = 1000000000000;

        const res = {
            number: null,
            display: null
        };

        if (roundNumber < ONE_THOUSAND) {
            res.number  = roundNumber;
            res.display = roundNumber;

        } else if (roundNumber < ONE_MILLION) {
            res.number  = Math.floor(roundNumber / 100) / 10;
            res.display = `${res.number}K`;
            res.number  *= 1000; 
            
        } else if (roundNumber < ONE_BILLION) {
            res.number  = Math.floor(roundNumber / 100000) / 10;
            res.display = `${res.number}M`;
            res.number *= ONE_MILLION;
            
        } else if (roundNumber < ONE_TRILLION) {
            res.number  = Math.floor(roundNumber / 100000000) / 10;
            res.display = `${res.number}B`;
            res.number *= ONE_BILLION;

        } else {
            res.number  = Math.floor(roundNumber / 100000000000) / 10;
            res.display = `${res.number}T`;
            res.number *= ONE_TRILLION;

        }
        return res;
    }

    // round up
    function rr(number) {
        const n = (Math.floor(number * 100) / 100).toString();
        if (n.indexOf(".") !== -1) {
            const suffex = n.split(".")[1];
            if (suffex.length == 1) {
                return `${n}0`;
            } else {
                return n;
            }
        }
        return `${n}.00`;
    }

    function rrn(numberStr) {
        return parseFloat(rr(numberStr));
    }

    function rrs(numberStr) {
        let res = [];
        const preFix = rr(numberStr).split(".")[0];
        let index = preFix.length - 1;
        for (let i = preFix.length - 1; i >= 0; i--) {
            let count = 3;
            let pack = [];
            while (count > 0 && index >= 0) {
                pack.push(preFix[index])
                index -= 1;
                count -= 1;
            }
            if (pack.length > 0) {
                res.push(pack.reverse());
            }
        }
        res = res.reverse();
        res = res.map(x => x.join(""));
        res = res.join(" ");
        return res; 
    }

    const SAVE_KEY = "land_lord_game";
    function save(state) {
        window.localStorage.setItem(SAVE_KEY, 
            JSON.stringify(state)
        );
    }
    
    function load() {
        return JSON.parse(
            window.localStorage.getItem(SAVE_KEY)
        );
    }

    // ref - displays
    const money_area  = qs(".money-area");
    const total_money = qs(".money-area .value");
    const total_sign  = qs(".money-area .sign");
    const invest_gain = qs(".invest-gain");
    const loan_loss  = qs(".loan-loss");
    const house_sign = qs(".house-sign");
    const house_net  = qs(".house-net");
    const rate_sign  = qs(".rate .sign");
    const rate_value = qs(".rate .value");
    const rate       = qs(".rate");
    
    // ref - UI state
    const promo_cost  = qs(".promo_cost span");
    const promo_count = qs(".promo_count");
    const invest_cost  = qsa(".invest-cost");
    const invest_count = qsa(".invest-count");
    const loan_value  = qsa(".loan-value");
    const work_value  = qs(".work-value span");
    const house_value = qsa(".house-value");
    const house_count = qsa(".house-count");
    const agent_cost  = qsa(".agent-cost");
    const renter_clicks = qsa(".renter-clicks");
    const renter_time   = qsa(".renter-time");

    // ref - UI elements
    const promo_row  = qs(".promo-row");
    const invest_row = qsa(".invest-row");
    const loan_row   = qsa(".loan-row");
    const loan_btn   = qsa(".loan-btn");
    const house_row  = qsa(".house-row");
    const agent_row  = qsa(".agent-row");
    const renter_row = qsa(".renter-row"); 
    const invest_sell_btn = qsa(".sell-area.invest");
    const house_sell_btn  = qsa(".house-row .sell-area");
    const agent_fire_btn  = qsa(".fire-area");

    /*
    const salary = document.querySelector(".salary.display > span");
    const total_profits = document.querySelector(".total_profits.display > span");
    const investments = document.querySelector(".investments.display > span"); */

    function render(state) {
        
        // Map state to displays
        total_sign.innerHTML = (state.total_money >= 0)? "+" : "-";
        total_money.innerHTML = rrs(Math.abs(state.total_money));
        setColor(money_area, (state.total_money >= 0)? "green" : "red");

        invest_gain.innerHTML = rr(state.total_invest * state.data.invest_rate);
        loan_loss.innerHTML   = rr(state.total_loan * state.data.loan_rate);
        
        const houseNet = calcHouseNet(state);
        house_sign.innerHTML = (houseNet >= 0) ? "+ " : "- ";
        house_net.innerHTML = rr(Math.abs(houseNet));

        // Set interface values
        promo_cost.innerHTML  = dn(calcPromoCost(state.promo_index)).display;
        promo_count.innerHTML = state.promo_index;
        work_value.innerHTML  = dn(state.work_value).display;
        for (let i in state.data.invest_cost) {
            i = parseInt(i, 10);
            invest_cost[i].innerHTML = dn(state.data.invest_cost[i]).display;
            invest_count[i].innerHTML = state.invest_count[i];
        }
        for (let i in state.data.loan_value) {
            i = parseInt(i, 10);
            loan_value[i].innerHTML = dn(state.data.loan_value[i]).display;
            if (state.loan_state[i]) {
                loan_btn[i].innerHTML = "Pay";
                setColor(loan_btn[i].parentElement, "red");
            } else {
                loan_btn[i].innerHTML = "Get";
                setColor(loan_btn[i].parentElement, "green");
            }
        }
        for (let i in state.data.house_value) {
            i = parseInt(i, 10);
            house_value[i].innerHTML = dn(state.data.house_value[i]).display;
            house_count[i].innerHTML = state.house_count[i];
            const cost = calcAgentCost(state, i);
            agent_cost[i].innerHTML = dn(cost).display;
            renter_time[i].innerHTML = state.renter_time_left[i];
        }
        for (let i in state.renter_exists) {
            i = parseInt(i, 10);
            renter_clicks[i].innerHTML = state.renter_clicks_left[i];
        }

        const moneyChange = calcMoneyChange(state);
        const rateSign = (moneyChange >= 0)? "+" : "-"; 
        rate_sign.innerHTML = rateSign;
        rate_value.innerHTML = dn(Math.abs(moneyChange)).display;
        setColor(rate, (moneyChange >= 0)? "green" : "red");

        // Set active state of elements
        setActiveState(state);
        applyActiveState(state);
    }

    function setActiveState(state) {
        const next_promo_cost = dn(calcPromoCost(state.promo_index)).number;
        state.active.promo_row = next_promo_cost <= state.total_money;

        for (let i in state.data.invest_cost) {
            i = parseInt(i, 10);
            const invest_cost = state.data.invest_cost[i];
            const haveMoney = invest_cost <= state.total_money;
            const underLimit = state.invest_count[i] < state.data.invest_limit;
            state.active.invest_row[i] = haveMoney && underLimit;
            state.active.invest_sell_btn[i] = state.invest_count[i] > 0; 
        }

        for (let i in state.data.loan_value) {
            i = parseInt(i, 10);
            const loan_value = state.data.loan_value[i];
            const hasLoan = state.loan_state[i];
            if (hasLoan) {
                const canAffordLoan = loan_value <= state.total_money;
                state.active.loan_row[i] = canAffordLoan;

            } else {
                const canAffordLoan = loan_value <= state.total_invest * 10;
                state.active.loan_row[i] = canAffordLoan;
            }
        }

        for (let i in state.data.house_value) {
            i = parseInt(i, 10);
            const house_value = state.data.house_value[i];
            const affordHouse = house_value <= state.total_money;
            const checkHouseLimit = state.house_count[i] < state.data.house_limit;
            state.active.house_row[i] = affordHouse && checkHouseLimit;
            state.active.house_sell_btn[i] = state.house_count[i] > 0;
            state.active.agent_fire_btn[i] = state.agent[i];
            state.active.renter_row[i] = state.house_count[i] > 0 && !state.agent[i]; 
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
        for (let i in state.data.house_value) {
            i = parseInt(i, 10);
            setActive(house_row[i], state.active.house_row[i]);
            setActive(house_sell_btn[i], state.active.house_sell_btn[i]);
            setActive(agent_fire_btn[i], state.active.agent_fire_btn[i]);
            setActive(agent_row[i], !state.active.agent_fire_btn[i]);
            setActive(renter_row[i], state.active.renter_row[i]);
        }
    }

    function main() {
        // data
        const data = {
            invest_cost: [
                250,
                5000,
                100000
            ],
            loan_value: [
                3000,
                50000,
                250000
            ],
            invest_rate: 0.0016,
            loan_rate: 0.0032,
            renter_rate: 0.0048,
            prop_tax_rate: 0.0016,
            renter_time: 120,
            house_limit: 5,
            invest_limit: 9,
            agent_cost: 0.0048,
            renter_click: [
                20,
                30,
                50,
                75,
                100
            ],
            house_value: [
                1000,
                20000,
                250000,
                1000000,
                20000000
            ],
            renter_clicks: [
                30,
                40,
                50,
                60,
                75
            ]
        }

        let state = {
            
            data: data,

            // work
            work_value: 1,

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
            house_count: [0, 0, 0, 0, 0],
            loan_state: [false, false, false],
            agent: [false, false, false, false, false],
            renter_exists: [false, false, false, false, false],
            renter_time_left: [0, 0, 0, 0, 0],
            renter_clicks_left: [0, 0, 0, 0, 0],

            // UI state
            active: {
                promo_row: false,
                invest_row: [false, false, false],
                invest_sell_btn: [false, false, false],
                loan_row: [false, false, false],
                house_row: [false, false, false, false, false],
                house_sell_btn: [false, false, false, false, false],
                agent_fire_btn: [false, false, false, false, false],
                renter_row: [false, false, false, false, false],
            }
        };

        // init
        for (let i in state.renter_exists) {
            i = parseInt(i, 10);
            state.renter_clicks_left[i] = state.data.renter_click[i];
        }

        const resetState = JSON.stringify(state);

        // Possibly load existing state
        const stateOrNull = load(state);
        if (stateOrNull !== null) {
            state = stateOrNull;
        }

        const click = clickFact(state);
        const click_all = clickFact_all(state); 

        click(".work-btn", (state) => {
            state.total_money += state.work_value;
            state.job_value += state.work_value;
        });

        click(".promo-btn", (state) => {
            if (state.active.promo_row) {
                state.total_money -= dn(calcPromoCost(state.promo_index)).number;
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

        click_all(".house-btn", (state, index) => {
            if (state.active.house_row[index]) {
                state.total_money -= state.data.house_value[index];
                state.house_count[index] += 1;
            }
        });

        click_all(".house-row .sell-area", (state, index) => {
            if (state.active.house_sell_btn[index]) {
                state.total_money += state.data.house_value[index];
                state.house_count[index] -= 1;
                
                // Reset renters if house count zero 
                if (state.house_count[index] == 0) {
                    state.renter_exists[index] = false;
                    state.renter_time_left[index] = 0;
                    state.renter_clicks_left[index] = state.data.renter_clicks[index];
                }
            }
        });

        click_all(".agent-hire", (state, index) => {
            state.agent[index] = true;
        });

        click_all(".fire-area", (state, index) => {
            state.agent[index] = false;
            state.renter_exists[index] = false;
            state.renter_time_left[index] = 0;
        });

        click_all(".renter-btn", (state, index) => {
            if (state.active.renter_row[index]) {
                state.renter_clicks_left[index] -= 1;
                if (state.renter_clicks_left[index] <= 0) {
                    state.renter_exists[index] = true;
                    state.renter_time_left[index] = state.data.renter_time;
                    state.renter_clicks_left[index] = state.data.renter_clicks[index];
                }
            }
        });

        click(".reset-link", (state) => {
            const rState = JSON.parse(resetState); 
            if (confirm("Reset all progress? (This cannot be undone.)")) {
                for (let k in state) {
                    state[k] = rState[k];
                }
            }
        });

        render(state);
        setInterval(() => {
            state.total_money += calcMoneyChange(state);
            state.total_money = rrn(state.total_money);

            for (let i in state.renter_exists) {
                i = parseInt(i, 10);
                if (state.renter_exists[i] && state.renter_time_left[i] > 0) {
                    state.renter_time_left[i] -= 1;
                    if (state.renter_time_left[i] <= 0) {
                        state.renter_exists[i] = false;
                    }
                }
            }

            render(state);
            save(state);
        }, 1000);

    }

    main();

})();