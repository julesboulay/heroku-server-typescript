import Config from "./configType";

export default function(env: string): Config {
  if (env == "development") {
    const development: Config = {
      google_places_api_key: "AIzaSyCOL-TKrDjemTBuwoNQcnpOFgMavyFErmc",
      secret: "abracadabra",
      database: {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "Lote1516",
        db: "comp3330"
      },
      python_server: {
        url: "http://0.0.0.0:5000"
      }
    };
    return development;
  } else {
    const production: Config = {
      google_places_api_key: "AIzaSyCOL-TKrDjemTBuwoNQcnpOFgMavyFErmc",
      secret: "abracadabra",
      database: {
        host: "remotemysql.com",
        port: 3306,
        user: "X4oiYHxxD6",
        password: "PLhYCqmXtt",
        db: "X4oiYHxxD6"
      },
      python_server: {
        url: "https://unfiltered-hk-python.herokuapp.com/"
      }
    };
    return production;
  }
}
