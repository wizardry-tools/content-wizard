import App from './App';
import {Container, createRoot} from "react-dom/client";

it('renders without crashing', () => {
  const div = document.createElement('div');

  const root = createRoot(div as Container);

  root.render(
    <App/>
  )

});
