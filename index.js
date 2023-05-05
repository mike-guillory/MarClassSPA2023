import { Header, Nav, Main, Footer } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { capitalize } from "lodash";
import axios from "axios";
import dotenv from "dotenv";

// Make sure that dotenv.config(); is placed after all of you import statements
dotenv.config();
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
  }

router.hooks({
  before: (done, params) => {
    const view = params && params.data && params.data.view ? capitalize(params.data.view) : "Home";
    // Add a switch case statement to handle multiple routes
    switch (view) {
      // case "Home":
      //   console.log({process.env.OPEN_WEATHER_MAP_API_KEY})
      //   axios
      //     .get(`https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&q=st%20louis`)
      //     .then(response => {
      //       // Convert Kelvin to Fahrenheit since OpenWeatherMap does provide otherwise
      //       const kelvinToFahrenheit = kelvinTemp =>
      //       Math.round((kelvinTemp - 273.15) * (9 / 5) + 32);
      //       store.Home.weather = {
      //         city: response.data.name,
      //         temp: kelvinToFahrenheit(response.data.main.temp),
      //         feelsLike: kelvinToFahrenheit(response.data.main.feels_like),
      //         description: response.data.weather[0].main
      //       };
      //       done();
      //     })
      //     .catch((error) => {
      //       console.log("It puked", error);
      //       done();
      //     });
      //     break;
      case "Pizza":
        console.log((`${process.env.PIZZA_PLACE_API_URL}/pizzas`));
        // New Axios get request utilizing already made environment variable
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
    const view = params && params.data && params.data.view ? capitalize(params.data.view) : "Home";

    render(store[view]);
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
  })
  .resolve();