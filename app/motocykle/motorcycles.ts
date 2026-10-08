export type Motorcycle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  type: string;
  power: string;
};

export const bikes: Motorcycle[] = [
  { id:"yamaha-mt07", brand:"Yamaha", model:"MT-07", year:2025, engine:"689 cm³", type:"Naked", power:"73 KM" },
  { id:"yamaha-mt09", brand:"Yamaha", model:"MT-09", year:2025, engine:"890 cm³", type:"Naked", power:"119 KM" },
  { id:"yamaha-yz125", brand:"Yamaha", model:"YZ125", year:2025, engine:"125 cm³", type:"MX", power:"2T" },
  { id:"yamaha-yz250", brand:"Yamaha", model:"YZ250", year:2025, engine:"250 cm³", type:"MX", power:"2T" },
  { id:"yamaha-r7", brand:"Yamaha", model:"R7", year:2025, engine:"689 cm³", type:"Sport", power:"73 KM" },
  { id:"yamaha-tenere700", brand:"Yamaha", model:"Ténéré 700", year:2025, engine:"689 cm³", type:"Adventure", power:"73 KM" },
  { id:"honda-cbr650r", brand:"Honda", model:"CBR650R", year:2025, engine:"649 cm³", type:"Sport", power:"95 KM" },
  { id:"honda-cb650r", brand:"Honda", model:"CB650R", year:2025, engine:"649 cm³", type:"Naked", power:"95 KM" },
  { id:"honda-crf250r", brand:"Honda", model:"CRF250R", year:2025, engine:"250 cm³", type:"MX", power:"4T" },
  { id:"honda-crf450r", brand:"Honda", model:"CRF450R", year:2025, engine:"450 cm³", type:"MX", power:"4T" },
  { id:"honda-africa-twin", brand:"Honda", model:"Africa Twin", year:2025, engine:"1 084 cm³", type:"Adventure", power:"102 KM" },
  { id:"honda-rebel500", brand:"Honda", model:"Rebel 500", year:2025, engine:"471 cm³", type:"Cruiser", power:"46 KM" },
  { id:"suzuki-gsx8r", brand:"Suzuki", model:"GSX-8R", year:2025, engine:"776 cm³", type:"Sport", power:"83 KM" },
  { id:"suzuki-gsx8s", brand:"Suzuki", model:"GSX-8S", year:2025, engine:"776 cm³", type:"Naked", power:"83 KM" },
  { id:"suzuki-vstrom800", brand:"Suzuki", model:"V-Strom 800", year:2025, engine:"776 cm³", type:"Adventure", power:"84 KM" },
  { id:"suzuki-rm125", brand:"Suzuki", model:"RM125", year:2008, engine:"125 cm³", type:"MX", power:"2T" },
  { id:"kawasaki-z900", brand:"Kawasaki", model:"Z900", year:2025, engine:"948 cm³", type:"Naked", power:"125 KM" },
  { id:"kawasaki-ninja650", brand:"Kawasaki", model:"Ninja 650", year:2025, engine:"649 cm³", type:"Sport", power:"68 KM" },
  { id:"kawasaki-zx6r", brand:"Kawasaki", model:"ZX-6R", year:2025, engine:"636 cm³", type:"Sport", power:"124 KM" },
  { id:"kawasaki-kx250", brand:"Kawasaki", model:"KX250", year:2025, engine:"249 cm³", type:"MX", power:"4T" },
  { id:"kawasaki-kx450", brand:"Kawasaki", model:"KX450", year:2025, engine:"449 cm³", type:"MX", power:"4T" },
  { id:"ktm-125-duke", brand:"KTM", model:"125 Duke", year:2025, engine:"125 cm³", type:"Naked", power:"15 KM" },
  { id:"ktm-390-duke", brand:"KTM", model:"390 Duke", year:2025, engine:"399 cm³", type:"Naked", power:"45 KM" },
  { id:"ktm-890-adventure", brand:"KTM", model:"890 Adventure", year:2024, engine:"889 cm³", type:"Adventure", power:"105 KM" },
  { id:"ktm-300-exc", brand:"KTM", model:"300 EXC", year:2025, engine:"293 cm³", type:"Enduro", power:"2T" },
  { id:"husqvarna-te300", brand:"Husqvarna", model:"TE 300", year:2025, engine:"293 cm³", type:"Enduro", power:"2T" },
  { id:"husqvarna-svartpilen401", brand:"Husqvarna", model:"Svartpilen 401", year:2025, engine:"399 cm³", type:"Naked", power:"45 KM" },
  { id:"gasgas-ec300", brand:"GasGas", model:"EC 300", year:2025, engine:"293 cm³", type:"Enduro", power:"2T" },
  { id:"beta-rx300", brand:"Beta", model:"RX 300", year:2025, engine:"293 cm³", type:"MX", power:"2T" },
  { id:"beta-rr300", brand:"Beta", model:"RR 300", year:2025, engine:"293 cm³", type:"Enduro", power:"2T" },
  { id:"tm-en300", brand:"TM Racing", model:"EN 300", year:2025, engine:"300 cm³", type:"Enduro", power:"2T" },
  { id:"aprilia-rs660", brand:"Aprilia", model:"RS 660", year:2025, engine:"659 cm³", type:"Sport", power:"105 KM" },
  { id:"aprilia-tuareg660", brand:"Aprilia", model:"Tuareg 660", year:2025, engine:"659 cm³", type:"Adventure", power:"80 KM" },
  { id:"ducati-monster", brand:"Ducati", model:"Monster", year:2025, engine:"937 cm³", type:"Naked", power:"111 KM" },
  { id:"ducati-panigale-v2", brand:"Ducati", model:"Panigale V2", year:2025, engine:"890 cm³", type:"Sport", power:"120 KM" },
  { id:"bmw-r1300gs", brand:"BMW", model:"R 1300 GS", year:2025, engine:"1 300 cm³", type:"Adventure", power:"145 KM" },
  { id:"bmw-s1000rr", brand:"BMW", model:"S 1000 RR", year:2025, engine:"999 cm³", type:"Sport", power:"210 KM" },
  { id:"triumph-streettriple", brand:"Triumph", model:"Street Triple 765", year:2025, engine:"765 cm³", type:"Naked", power:"120 KM" },
  { id:"triumph-tiger900", brand:"Triumph", model:"Tiger 900", year:2025, engine:"888 cm³", type:"Adventure", power:"108 KM" },
  { id:"yamaha-r3", brand:"Yamaha", model:"R3", year:2025, engine:"321 cm³", type:"Sport", power:"42 KM" },
  { id:"yamaha-r1", brand:"Yamaha", model:"R1", year:2025, engine:"998 cm³", type:"Sport", power:"200 KM" },
  { id:"honda-cb500-hornet", brand:"Honda", model:"CB500 Hornet", year:2025, engine:"471 cm³", type:"Naked", power:"48 KM" },
  { id:"honda-crf300l", brand:"Honda", model:"CRF300L", year:2025, engine:"286 cm³", type:"Enduro", power:"27 KM" },
  { id:"suzuki-gsx-s1000", brand:"Suzuki", model:"GSX-S1000", year:2025, engine:"999 cm³", type:"Naked", power:"152 KM" },
  { id:"suzuki-hayabusa", brand:"Suzuki", model:"Hayabusa", year:2025, engine:"1 340 cm³", type:"Sport", power:"190 KM" },
  { id:"kawasaki-ninja500", brand:"Kawasaki", model:"Ninja 500", year:2025, engine:"451 cm³", type:"Sport", power:"45 KM" },
  { id:"kawasaki-versys650", brand:"Kawasaki", model:"Versys 650", year:2025, engine:"649 cm³", type:"Adventure", power:"67 KM" },
  { id:"ktm-690-enduro-r", brand:"KTM", model:"690 Enduro R", year:2025, engine:"693 cm³", type:"Enduro", power:"79 KM" },
  { id:"aprilia-tuono660", brand:"Aprilia", model:"Tuono 660", year:2025, engine:"659 cm³", type:"Naked", power:"95 KM" },
  { id:"ducati-multistrada-v2", brand:"Ducati", model:"Multistrada V2", year:2025, engine:"890 cm³", type:"Adventure", power:"115 KM" },
  { id:"bmw-f900gs", brand:"BMW", model:"F 900 GS", year:2025, engine:"895 cm³", type:"Adventure", power:"105 KM" },
  { id:"triumph-daytona660", brand:"Triumph", model:"Daytona 660", year:2025, engine:"660 cm³", type:"Sport", power:"95 KM" },
];