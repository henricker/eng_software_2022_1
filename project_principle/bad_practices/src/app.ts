import http from 'http';
import { routes, RoutesType } from './routes';

class App {
  public server: http.Server;

  constructor() {
    this.server = http.createServer(this.handleRequest);
  }

  public handleRequest(request: http.IncomingMessage, response: http.ServerResponse): void {
    const path = `${request.method} ${request.url}`;
    const keys = Object.keys(routes);

    const hasPath = keys.find((key) => {
      return new RegExp(key).test(path);
    }) as RoutesType;

    if(!hasPath) {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify({ error: 'Not found route' }));
      response.end();
      return;
    }

    routes[hasPath](request, response);
  }

  public listen(port: number, listeningListener?: (() => void)): void {
    this.server.listen(port, listeningListener);
  }
}

export const app = new App();

