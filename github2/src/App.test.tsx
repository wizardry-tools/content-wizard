import { render, screen } from '@testing-library/react';
import { describe, it, expect} from 'vitest';
import App from './App';


const statement = /Search AEM Content with ease using the Content Wizard's Query Wizard, a simple form driven approach to building and executing QueryBuilder statements./i

describe('App Compoennt', ()=>{
  it('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(statement);
    expect(linkElement).toBeInTheDocument();
  });
})

