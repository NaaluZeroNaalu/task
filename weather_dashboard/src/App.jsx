import React, { useState, useEffect } from 'react';
import { TbCloudSearch } from "react-icons/tb";
import './App.css';
import { MdFavoriteBorder, MdWbSunny } from "react-icons/md";

function App() {
  const [datas, getDatas] = useState([]);
  const [city, Getcity] = useState("chennai");
  const [loading, setLoading] = useState(false);
  const [darklight, Getdarklight] = useState(true);
  const [start, Getstart] = useState(0);
  const [end, Getend] = useState(7);
  const [error, setError] = useState("");

  const convertTo12HourFormat = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    const period = (hours >= 12) ? "PM" : "AM";

    let hours12 = (hours > 12) ? hours - 12 : hours;
    hours12 = (hours12 === 0) ? 12 : hours12;

    return `${hours12}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
  };

  const convertToCelsius = (kelvin) => {
    return (kelvin - 273.15).toFixed(2);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=e1729df704491a1644aad19f9474870b`)
      .then(res => {
        if (!res.ok) {
          throw new Error('City not found');
        }
        return res.json();
      })
      .then(data => {
        getDatas(data.list);
        setError("");
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        getDatas([]);
        setError("City not found");
        setLoading(false);
      });
  }, [city]);

  const filteredForecast = datas.filter(item =>
    item.dt_txt.includes('12:00:00')
  );

  const Displaytimecast = (day) => {
    if (day === 1) {
      Getstart(0);
      Getend(8);
    } else if (day === 2) {
      Getstart(8);
      Getend(16);
    } else if (day === 3) {
      Getstart(16);
      Getend(24);
    } else if (day === 4) {
      Getstart(24);
      Getend(32);
    } else {
      Getstart(32);
      Getend(40);
    }
  };

  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const saveFavoriteCity = () => {
    let favoriteCities = localStorage.getItem("fav");
    if (favoriteCities) {
      favoriteCities = favoriteCities.split(',');
      if (!favoriteCities.includes(city) && city !== "City not found") {
        favoriteCities.push(city);
      }
    } else {
      favoriteCities = [city];
    }
    localStorage.setItem("fav", favoriteCities.join(','));
  };

  const getFavoriteCities = () => {
    let favoriteCities = localStorage.getItem("fav");
    if (favoriteCities) {
      return favoriteCities.split(',');
    }
    return [];
  };

  useEffect(() => {
    if (darklight) {
      document.body.style.backgroundColor = "#87CEEB"; // Light blue
      document.body.style.background = "linear-gradient(to right, #00BFFF, #87CEEB)"; // Gradient background
    } else {
      document.body.style.backgroundColor = "#1e1e1e"; // Dark background for dark mode
      document.body.style.background = "";
    }
  }, [darklight]);

  return (
    <>
      <button className="btn" style={{ float: "left" }} onClick={() => {
        if (darklight) {
          document.body.setAttribute("data-bs-theme", "dark");
          Getdarklight(false);
        } else {
          document.body.setAttribute("data-bs-theme", "");
          Getdarklight(true);
        }
      }}>
        <MdWbSunny />
      </button>
      
      <div className="dropdown" style={{ float: "right" }}>
        <button type="button" className="btn dropdown-toggle" data-bs-toggle="dropdown">
          Your Favorites
        </button>
        <ul className="dropdown-menu">
          {
            getFavoriteCities().map((val, index) => (
              <li key={index}>
                <button className="dropdown-item" onClick={() => {
                  Getcity(val);
                }}>
                  {val}
                </button>
              </li>
            ))
          }
        </ul>
      </div>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          onInput={(e) => { Getcity(e.target.value.trim()) }}
          placeholder="Search..."
        />
      </div>
      <p>City</p>
      <h1>{error === "" ? city : error}<span> <button className="btn" onClick={saveFavoriteCity} style={{ float: "right" }}>
          <MdFavoriteBorder />
        </button></span></h1>
     
      <h3>Hourly Forecast</h3>
      <hr />

      <div className="row">
        {
          datas.slice(start, end).map((time, i) => (
            <div key={i} className="col">
              <p>{convertTo12HourFormat(time.dt_txt)}</p>
              <p>{convertToCelsius(time.main.temp)} °C</p>
              <img src={getWeatherIconUrl(time.weather[0].icon)} alt="no icon" />
            </div>
          ))
        }
      </div>

      <h3>Daily Forecast</h3>
      <hr />
      <div className="row">
        {
          filteredForecast.map((val, day) => (
            <div key={day} className="col">
              <button className="btn" onClick={() => Displaytimecast(day + 1)}><h4>Day {day + 1}</h4></button>
              {
                loading ? (
                  <button className="btn">
                    <span className="spinner-border spinner-border-sm"></span>
                  </button>
                ) : (
                  <>
                    <p>{val.weather[0].main}</p>
                    <img src={getWeatherIconUrl(val.weather[0].icon)} alt="no icon" />
                  </>
                )
              }
            </div>
          ))
        }
      </div>
    </>
  );
}

export default App;
