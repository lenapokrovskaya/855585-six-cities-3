// import { TOffer } from '../../types/toffer';
// import { cities } from '../../const';
// import FavoriteItem from '../favorite-item/favorite-item';

// type FavoriteListProps = {
//   favoriteOffers: TOffer[];
// };

// Определяем тип через индексный синтаксис
// type OffersByCity = {
//   [city: string]: TOffer[];
// };

function FavoriteList(): JSX.Element {
  // const favoritesOffersByCity = cities.reduce((acc, city) => {
  //   const cityOffers = favoriteOffers.filter((offer) => offer.city.name === city);
  //   if (cityOffers.length > 0) {
  //     acc[city] = cityOffers;
  //   }
  //   return acc;
  // }, {} as OffersByCity); //Приводим {} к типу OffersByCity

  return (
    <ul className="favorites__list">
      {/* {Object.entries(favoritesOffersByCity).map(([city, cityOffers]) => (
        <FavoriteItem key={city} city={city} favoriteOffers={cityOffers} />
      ))} */}
    </ul>
  );
}

export default FavoriteList;
