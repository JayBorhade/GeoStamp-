import {fireEvent,render,screen} from '@testing-library/react';
import {describe,expect,it} from 'vitest';
import App from './App';
describe('GeoStamp workspace',()=>{
 it('shows main tools and privacy-first empty state',()=>{render(<App/>);expect(screen.getByText('GeoStamp')).toBeInTheDocument();expect(screen.getAllByRole('button',{name:/Upload Photos/i}).length).toBeGreaterThan(0);expect(screen.getByRole('button',{name:/Capture Location/i})).toBeInTheDocument();expect(screen.getByRole('button',{name:/Add Stamp/i})).toBeInTheDocument();expect(screen.getByText(/Your next photo story starts here/i)).toBeInTheDocument();});
 it('opens privacy settings',()=>{render(<App/>);fireEvent.click(screen.getAllByRole('button',{name:/Settings/i})[0]);expect(screen.getByRole('dialog')).toBeInTheDocument();expect(screen.getByText(/does not upload files to a server/i)).toBeInTheDocument();});
});
