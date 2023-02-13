# LandLord

A clicker game about owning property.

![](./img/LandLord.png)

# Cheats

Enter the following in the console, and the work button will be auto-clicked 5x a sec. Set `d = false;` to stop the auto-clicking.

```js
let d = true;
```

```js
setInterval(() => {
    if (d) {
        document.querySelector(".work-btn").click();
    }
}, 200);
```

# TODO

- [ ] Help page
    - [ ] Video tutorial
    - [ ] Written explination

# Bug


# Done

- [x] Disable Pay loan if you can't afford to pay back
- [x] Renter should reset if house is sold
- [x] Should be able to pay back loan if you don't have the investments
- [x] Limit investments to nine total
- [x] Improve numbers, so the game has a sensible curve
- [x] Numbers should display as 1k, 1M, 1B
- [x] Ability to activate a renter
- [x] Houses should only make money if a renter is in them
- [x] Ability to fire an agent
- [x] Ability to sell an investment
- [x] Show total rate of change next to total money
    - [x] Colored red/green accordingly
- [x] Save state to local storage
    - [x] Load from local storage on page load
- [x] Reset game progress
- [x] Second house should cost 20k because loan is 50k
- [x] Spaces in money field to make more readable