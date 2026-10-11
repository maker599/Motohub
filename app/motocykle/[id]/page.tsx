import BikeDetails from "./BikeDetails";

export const instant = false;

export default async function BikePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BikeDetails id={id} />;
}
