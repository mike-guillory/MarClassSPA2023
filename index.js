import { Header, Nav, Main, Footer } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { capitalize } from "lodash";
import axios from "axios";

const router = new Navigo("/");

function render(state = store.Home) {
  document.querySelector("#root").innerHTML = `
    ${Header(state)}
    ${Nav(store.Links)}
    ${Main(state)}
    ${Footer()}
    `;

    afterRender(state);

    router.updatePageLinks();
  }

  // add menu toggle to bars icon in nav bar
  function afterRender(state){
    document.querySelector(".fa-bars").addEventListener("click", () => {
      document.querySelector("nav > ul").classList.toggle("hidden--mobile");
    });

    // Event listener on the Pizza order form to submit pizza order
    if (state.view === "Order") {
      document.querySelector("form").addEventListener("submit", event => {
        event.preventDefault();

        const inputList = event.target.elements;
        console.log("Input Element List", inputList);

        const toppings = [];
        // Iterate over the toppings input group elements
        for (let input of inputList.toppings) {
          // If the value of the checked attribute is true then add the value to the toppings array
          if (input.checked) {
            toppings.push(input.value);
          }
        }

        const requestData = {
          customer: inputList.customer.value,
          crust: inputList.crust.value,
          cheese: inputList.cheese.value,
          sauce: inputList.sauce.value,
          toppings: toppings
        };
        console.log("request Body", requestData);

        axios
          .post(`${process.env.PIZZA_PLACE_API_URL}/pizzas`, requestData)
          .then(response => {
            // Push the new pizza onto the Pizza state pizzas attribute, so it can be displayed in the pizza list
            store.Pizza.pizzas.push(response.data);
            // Go to Pizza page
            router.navigate("/Pizza");
          })
          .catch(error => {
            console.log("It puked", error);
          });
      });
    }
  }

router.hooks({
  before: (done, params) => {
    // console.log(`in before ${Date.now()}`);
    const view = params && params.data && params.data.view ? capitalize(params.data.view) : "Home";
    // Add a switch case statement to handle multiple routes
    switch (view) {
      case "Home":
        // New Axios get request utilizing already made environment variable
        axios
          .get(`https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&q=st%20louis`)
          .then(response => {
            // Convert Kelvin to Fahrenheit since OpenWeatherMap does provide otherwise
            const kelvinToFahrenheit = kelvinTemp =>
            Math.round((kelvinTemp - 273.15) * (9 / 5) + 32);
            store.Home.weather = {
              city: response.data.name,
              temp: kelvinToFahrenheit(response.data.main.temp),
              feelsLike: kelvinToFahrenheit(response.data.main.feels_like),
              description: response.data.weather[0].main
            };
            done();
          })
          .catch((error) => {
            console.log("It puked", error);
            done();
          });
          break;
      case "Pizza":
        axios
          .get(`${process.env.PIZZA_PLACE_API_URL}/pizzas`)
          .then(response => {
            // We need to store the response to the state, in the next step but in the meantime let's see what it looks like so that we know what to store from the response.
            console.log("response", response);
            store.Pizza.pizzas = response.data;
            done();
          })
          .catch((error) => {
            console.log("It puked", error);
            done();
          });
          break;
      default :
        done();
    }
  },
  already: (params) => {
    // console.log((`in already ${Date.now()}`));
    const view = params && params.data && params.data.view ? capitalize(params.data.view) : "Home";

    // render(store[view]);
  }
});

router
  .on({
    "/": () => render(),
    ":view": (params) => {
      let view = capitalize(params.data.view);
      if (view in store) {
        render(store[view]);
      } else {
        console.log(`View ${view} not defined`);
        render(store.Viewnotfound);
      }
    },
  },
      // console.log((`in router.on ${Date.now()}`)),
  )
  .resolve();
