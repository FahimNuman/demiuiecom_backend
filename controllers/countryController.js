import adminModel from "../models/adminModel.js";
import countryModel from "../models/countryModel.js";
import languageModel from "../models/languageModel.js";
import currencyModel from "../models/currencyModel.js";
import axios from "axios";
import timezoneModel from "../models/timezoneModel.js";

const index = async (req, res) => {


  try {
    const countries = await countryModel.find().sort({ name: 1 });

    console.log("countries", countries);

    res.json({ status: "success", data: countries });
  } catch (error) {
    console.error("Error fetching admins:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while fetching roles.",
      error: error.message,
    });
  }
};

const store = async (req, res) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,capital,region,flags');

    const countries = response.data.map(country => ({
      name: country.name.common,
      capital: country.capital || ['N/A'],
      region: country.region,
      flag: country.flags?.png
    }));

    await countryModel.deleteMany({}); // Clear old data (optional)
    await countryModel.insertMany(countries);

    res.send('Countries saved to MongoDB!');
  } catch (error) {
    console.log('Error saving countries', error);
    res.status(500).send('Error saving countries');
  }
};


const storeLanguage = async (req, res) => {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all?fields=languages");

    const data = response.data;
    const langMap = new Map();

    data.forEach((country) => {
      const languages = country.languages;
      if (languages) {
        Object.entries(languages).forEach(([code, name]) => {
          const lowerCode = code.toLowerCase();
          const properName = name.trim();

          if (!langMap.has(lowerCode)) {
            langMap.set(lowerCode, properName);
          }
        });
      }
    });

    const languageList = Array.from(langMap, ([code, name]) => ({
      name,
      code,
    }));

    languageList.sort((a, b) => a.name.localeCompare(b.name));

    await languageModel.deleteMany({});
    await languageModel.insertMany(languageList);

    res.send("Languages saved to MongoDB!");
  } catch (error) {
    console.error("Error fetching languages:", error);
    res.status(500).send("Failed to fetch or save languages");
  }
};


const getLanguage = async (req, res) => {
  try {
    const languages = await languageModel.find().sort({ name: 1 });
    res.json({ status: "success", data: languages });
  } catch (error) {
    console.error("Error fetching languages:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while fetching languages.",
      error: error.message,
    });
  }
};


const storeCurrency = async (req, res) => {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all?fields=currencies");

    const data = response.data;
    const currencyMap = new Map();

    data.forEach((country) => {
      const currencies = country.currencies;
      if (currencies) {
        Object.entries(currencies).forEach(([code, details]) => {
          const name = details.name?.trim();
          const symbol = details.symbol?.trim();

          // Avoid duplicate codes
          if (code && name && !currencyMap.has(code)) {
            currencyMap.set(code, { code, name, symbol: symbol || "" });
          }
        });
      }
    });

    const currencyList = Array.from(currencyMap.values());

    // Sort by name
    currencyList.sort((a, b) => a.name.localeCompare(b.name));

    // Store in DB
    await currencyModel.deleteMany({});
    await currencyModel.insertMany(currencyList);

    res.send("Currencies with symbols saved to MongoDB!");
  } catch (error) {
    console.error("Error fetching currencies:", error);
    res.status(500).send("Failed to fetch or save currencies");
  }
};

const storeTimezoneOld = async (req, res) => {
  try {
    const response = await axios.get("https://restcountries.com/v3.1/all?fields=timezones");

    const data = response.data;
    const timezoneMap = new Map();

    data.forEach((country) => {
      const timezones = country.timezones;
      if (timezones) {
        timezones.forEach((timezone) => {
          if (!timezoneMap.has(timezone)) {
            timezoneMap.set(timezone, timezone);
          }
        });
      }
    });

    const timezoneList = Array.from(timezoneMap.values());

    // Sort by name
    timezoneList.sort((a, b) => a.localeCompare(b));


    return res.json({
      status: "success",
      timezoneList,
    });

    // Store in DB
    // await timezoneModel.deleteMany({});
    // await timezoneModel.insertMany(timezoneList);

    // res.send("Timezones saved to MongoDB!");
  } catch (error) {
    console.error("Error fetching timezones:", error);
    res.status(500).send("Failed to fetch or save timezones");
  }
};



const storeTimezone = async (req, res) => {
  try {
    // Fetch timezones from REST Countries API
    const response = await axios.get("https://restcountries.com/v3.1/all?fields=timezones");

    const data = response.data;
    const timezoneMap = new Map();

    // Collect unique timezones
    data.forEach((country) => {
      const timezones = country.timezones;
      if (timezones) {
        timezones.forEach((timezone) => {
          if (timezone && !timezoneMap.has(timezone)) {
            timezoneMap.set(timezone, timezone);
          }
        });
      }
    });

    // Convert to array & sort
    const timezoneList = Array.from(timezoneMap.values()).sort((a, b) => a.localeCompare(b));

    // Format for DB insertion: { zone: "UTC+06:00" }
    const formattedList = timezoneList.map((tz) => ({ zone: tz }));

    // Save to MongoDB
    await timezoneModel.deleteMany({});
    await timezoneModel.insertMany(formattedList);

    // Respond
    res.json({
      status: "success",
      total: formattedList.length,
      message: "Timezones saved to MongoDB!",
    });
  } catch (error) {
    console.error("Error fetching or saving timezones:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch or save timezones",
    });
  }
};



const getTimezone = async (req, res) => {
  try {
    const timezones = await timezoneModel.find().sort({ zone: 1 });
    res.json({ status: "success", data: timezones });
  } catch (error) {
    console.error("Error fetching timezones:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while fetching timezones.",
      error: error.message,
    });
  }
};



const getCurrency = async (req, res) => {
  try {
    const currencies = await currencyModel.find().sort({ name: 1 });
    res.json({ status: "success", data: currencies });
  } catch (error) {
    console.error("Error fetching currencies:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while fetching currencies.",
      error: error.message,
    });
  }
};




const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminModel.findByIdAndDelete(id);
    res.json({
      status: "success",
      message: "Admin deleted successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting role:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while deleting the role.",
      error: error.message,
    });
  }
};




export { store, index, storeLanguage, getLanguage, storeCurrency, getCurrency, storeTimezone, getTimezone, destroy };