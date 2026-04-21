/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem } from './types';
import paosinglebir from './pao_single_bir.png';
import pao1_5bir from './1.5pao_single_bir.5.png';
import halfkgsingle from './halfkgsingle.png';
import halfkgdouble from './halfkgdouble.png';
import onekgfourpcs from './1kg4pcs.png';
import riceextra from './rice_extra.png';
import aloo_onepao from './aloo_onepao.png';
import aloo_oneandhalfpao from './aloo_oneandhalfpao.png';
import aloo_halfkg from './aloo_halfkg.png';
import aloo_onekg from './aloo_onekg.png';
import zarda from './zarda_sabir.png';
import salad from './salad.png';
import raita from './raita.png';
import paani from './paani.png';
import pulaosingleone from './pulaosingleone.png';
import pulaooneandhalf from './pulaosingleoneandhalf.png';
import pulaohalfkg from './pulaohalfkg.png';
import pulaohalfkgdouble from './pulaohalfkgdouble.png';
import pulaoonekg from './pulaoonekg.png';
import pulaorice from './pulaorice.png';
import pepsi_sabir from './pepsi_sabir.png';
import dew_sabir from './dew_sabir.png';
import sting_sabir from './sting_sabir.png';
import colanext_sabir from './colanext_sabir.png';
import fizzup_sabir from './fizzup_sabir.png';

export const MENU_ITEMS: MenuItem[] = [
  // Biryani
  { id: 'biri001', name: 'Chicken Biryani 250gm (1 pcs)', price: 170, category: 'Biryani', image: paosinglebir },
  { id: 'biri002', name: 'Chicken Biryani 375gm (1 pcs)', price: 220, category: 'Biryani', image: pao1_5bir },
  { id: 'biri003', name: 'Chicken Biryani 500gm (1 pcs)', price: 270, category: 'Biryani', image: halfkgsingle },
  { id: 'biri004', name: 'Chicken Biryani 500gm (2 pcs)', price: 320, category: 'Biryani', image: halfkgdouble },
  { id: 'biri005', name: 'Chicken Biryani 1000gm (4 pcs)', price: 650, category: 'Biryani', image: onekgfourpcs },
  { id: 'biri006', name: 'Biryani Rice (add-on)', price: 10, category: 'Biryani', image: riceextra },
  { id: 'biri007', name: 'Plain Biryani 250gm', price: 110, category: 'Biryani', image: aloo_onepao },
  { id: 'biri008', name: 'Plain Biryani 375gm', price: 170, category: 'Biryani', image: aloo_oneandhalfpao },
  { id: 'biri009', name: 'Plain Biryani 500gm', price: 230, category: 'Biryani', image: aloo_halfkg },
  { id: 'biri010', name: 'Plain Biryani 1000gm', price: 450, category: 'Biryani', image: aloo_onekg },

  // Pulao
  { id: 'pulao001', name: 'Chicken Pulao 250gm (1 pcs)', price: 170, category: 'Pulao', image: pulaosingleone },
  { id: 'pulao002', name: 'Chicken Pulao 375gm (1 pcs)', price: 220, category: 'Pulao', image: pulaooneandhalf },
  { id: 'pulao003', name: 'Chicken Pulao 500gm (1 pcs)', price: 270, category: 'Pulao', image: pulaohalfkg },
  { id: 'pulao004', name: 'Chicken Pulao 500gm (2 pcs)', price: 320, category: 'Pulao', image: pulaohalfkgdouble },
  { id: 'pulao005', name: 'Chicken Pulao 1000gm (4 pcs)', price: 650, category: 'Pulao', image: pulaoonekg },
  { id: 'pulao006', name: 'Chicken Pulao Rice (add-on)', price: 10, category: 'Pulao', image: pulaorice },

  // Sides
  { id: 'side001', name: 'Raita', price: 70, category: 'Sides', image: raita },
  { id: 'side002', name: 'Zarda', price: 100, category: 'Sides', image: zarda },
  { id: 'side003', name: 'Salad', price: 50, category: 'Sides', image: salad },

  
  // Drinks
  { id: 'drink001', name: 'Sting (glass bottle)', price: 70, category: 'Drinks', image: sting_sabir },
  { id: 'drink002', name: 'Water (small)', price: 40, category: 'Drinks', image: paani },
  { id: 'drink003', name: 'Water (large)', price: 90, category: 'Drinks', image: paani },
  { id: 'drink004', name: 'Mountain Dew (glass bottle)', price: 60, category: 'Drinks', image: dew_sabir },
  { id: 'drink005', name: 'Pepsi (glass bottle)', price: 60, category: 'Drinks', image: pepsi_sabir },
  { id: 'drink006', name: 'Cola Next', price: 60, category: 'Drinks', image: colanext_sabir },
  { id: 'drink007', name: 'Fizzup Next', price: 60, category: 'Drinks', image: fizzup_sabir },
];

export const CATEGORIES = Array.from(new Set(MENU_ITEMS.map(item => item.category)));

export const POS_NAME = "S7 - Sabir POS Terminal";
export const CURRENCY = "Rs.";
