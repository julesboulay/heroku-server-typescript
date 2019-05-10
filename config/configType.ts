export default interface Config {
  google_places_api_key: string;
  secret: string;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    db: string;
  };
  python_server: {
    url: string;
  };
}
