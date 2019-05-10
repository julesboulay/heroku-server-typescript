import Config from "./configType";

export default function(env: string): any {
  if (env == "development") {
    const development: Config = {
      google_places_api_key: "<api key>",
      secret: "<secret>",
      database: {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "password",
        db: "db_name"
      },
      python_server: {
        url: "python_url"
      }
    };
    return development;
  } else {
    const production: Config = {
      google_places_api_key: "<api key>",
      secret: "<secret>",
      database: {
        host: "localhost",
        port: 0,
        user: "root",
        password: "password",
        db: "db_name"
      },
      python_server: {
        url: "python_url"
      }
    };
    return production;
  }
}
