import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { NavLink } from 'react-router-dom';
import { FaStopCircle } from 'react-icons/fa';

const Aa = () => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="data-[state=open]:bg-amber-500 py-3 px-4">
          Shipping Details
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <div>
            <button>Processing</button>
          </div>
          <div>
            <button>Shipped</button>
          </div>
          <div>
            <button>Delivered</button>
          </div>
          <div>
            <button>Cancelled</button>
          </div>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2'
            }
          >
            <FaStopCircle />
            <span>Shop</span>
          </NavLink>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Shipping Details</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <div>
            <button>Processing</button>
          </div>
          <div>
            <button>Shipped</button>
          </div>
          <div>
            <button>Delivered</button>
          </div>
          <div>
            <button className="w-full text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2">
              Cancelled
            </button>
          </div>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2'
            }
          >
            <FaStopCircle />
            <span>Shop</span>
          </NavLink>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default Aa;
