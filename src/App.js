import React, { useEffect, useState } from "react";
import ReactSlider from "react-slider";
import MapComponent from "./components/MapComponent";
import exifData from "./data/data.json";
import "./App.css";

const dmsToDecimal = (dms) => {
  const parts = dms.match(/(\d+)\s*deg\s*(\d+)'\s*([\d.]+)"\s*([NSEW])/i);
  if (!parts) {
    console.error(`Invalid DMS format: ${dms}`);
    return NaN;
  }
  const degrees = parseFloat(parts[1]);
  const minutes = parseFloat(parts[2]);
  const seconds = parseFloat(parts[3]);
  const direction = parts[4].toUpperCase();

  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === "S" || direction === "W") {
    decimal *= -1;
  }
  return decimal;
};

// Convert year and month to slider value
const dateToSliderValue = (year, month) => (year - 2000) * 12 + (month - 1);

// Convert slider value back to year and month
const sliderValueToDate = (value) => {
  const year = Math.floor(value / 12) + 2000;
  const month = (value % 12) + 1;
  return { year, month };
};

const App = () => {
  const [data, setData] = useState([]);
  const [range, setRange] = useState([
    dateToSliderValue(2020, 1),
    dateToSliderValue(2020, 12),
  ]);

  useEffect(() => {
    const [startValue, endValue] = range;
    const startDate = sliderValueToDate(startValue);
    const endDate = sliderValueToDate(endValue);

    const convertedData = exifData.map((item) => ({
      ...item,
      latitude: dmsToDecimal(item.latitude),
      longitude: dmsToDecimal(item.longitude),
    }));

    const filteredData = convertedData.filter((item) => {
      const itemYear = parseInt(item.timestamp.split(":")[0], 10);
      const itemMonth = parseInt(item.timestamp.split(":")[1], 10);
      const itemDateValue = dateToSliderValue(itemYear, itemMonth);

      return itemDateValue >= startValue && itemDateValue <= endValue;
    });

    setData(filteredData);
  }, [range]);

  return (
    <div className="App">
      <div>
        <label>
          Month Range:
          <ReactSlider
            className="horizontal-slider"
            thumbClassName="thumb"
            trackClassName="track"
            value={range}
            min={dateToSliderValue(2000, 1)}
            max={dateToSliderValue(2024, 12)}
            step={1}
            onChange={(newRange) => setRange(newRange)}
            renderThumb={(props, state) => {
              const { year, month } = sliderValueToDate(state.valueNow);
              return (
                <div {...props}>{`${year}-${String(month).padStart(
                  2,
                  "0"
                )}`}</div>
              );
            }}
          />
        </label>
      </div>

      <div className="map-component">
        <MapComponent data={data} />
      </div>
    </div>
  );
};

export default App;
