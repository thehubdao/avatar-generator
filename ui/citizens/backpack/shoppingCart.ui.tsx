import { useEffect, useState } from "react";
import { setShoppingCart } from "../../../store/citizensMetadataSlice";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { ClaimableDrop } from "../../../interfaces/citizens.interface";
import PlusSVG from "../common/SVG/plusSVG.ui";
import Image from "next/image";
import BlockSVG from "../common/SVG/blockSVG.ui";
import { BiCartAlt } from 'react-icons/bi';

interface ShoppingCartUIProps {
  onRemoveItem: (type?: string) => void;
  onCheckOut: () => void;
}

export default function ShoppingCartUI({ onRemoveItem, onCheckOut }: ShoppingCartUIProps) {
  const shoppingCart = useAppSelector(state => state.citizensMetadata.shoppingCart);
  const claimableDrops = useAppSelector(state => state.citizensMetadata.claimableDrops);
  const userXP = useAppSelector(state => state.citizensAuth.xpData);
  const dispatch = useAppDispatch();

  const [shoppingCartItems, setShoppingCartItems] = useState<ClaimableDrop[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleRemove = (id: string | number, type: string) => {
    const updatedCart = shoppingCart.filter(item => item.val !== id);
    dispatch(setShoppingCart(updatedCart));
    onRemoveItem(type);
  };

  const getTotalAvailableItems = () => {
    return shoppingCartItems.length;
  }

  const getTotalPrice = () => {
    const total = shoppingCartItems
      .reduce((sum, item) => sum + (item.price || 0), 0);
    return Math.round(total * 10) / 10;
  }

  useEffect(() => {
    if (!claimableDrops) return;

    // Flatten the claimableDrops object to an array
    const allDrops = Object.values(claimableDrops).flat();

    // Filter the claimable drops based on the shopping cart, excluding blocked items
    const items = allDrops.filter(drop =>
      shoppingCart.some(cartItem =>
      cartItem.detail === drop.featureType &&
      cartItem.val === drop.featureName
      ) && (drop.requiredXP - (userXP?.xp || 0)) <= 0
    );

    setShoppingCartItems(items);
  }, [shoppingCart, claimableDrops]);

  return (
    <div className={`fixed top-24 xl:top-auto xl:bottom-8 right-4 rounded-[20px] ${isOpen ? 'w-[calc(100vw_-_2rem)] md:w-[419px] h-auto' : 'w-14 h-14'} overflow-hidden`}>
      <div className={`bg-citizens-dark shadow-citizens-btn w-full pr-2 pl-4 py-4 text-white`}>
        <div className={`${isOpen ? 'opacity-100' : 'opacity-0'} grid grid-rows-[auto_1fr_auto] gap-4 max-h-[35vh] xl:max-h-[70vh] 2xl:max-h-[90vh]`}>
          <h2 className="text-xl font-bold">Shopping cart</h2>
          {shoppingCartItems.length === 0 ? (
            <div className="text-center text-gray-400">Your cart is empty.</div>
          ) :
            <>
              <div className={`overflow-y-auto overflow-x-hidden`}>
                <ul>
                  {shoppingCartItems.map((item, idx) => {
                    const xpRequired = item.requiredXP - (userXP?.xp || 0);
                    return (
                      <li
                        key={item.id || idx}
                        className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0"
                      >
                        {/* DESCRIPTION */}
                        <div className="flex items-center gap-2">
                          <div className="rounded-xl overflow-hidden">
                            <Image src={item.imageUrl} alt={item.featureName} width={50} height={50} />
                          </div>
                          <div>
                            <div className="font-semibold text-xs">{item.featureName}</div>
                            <div className="text-gray-400 text-xs">{item.featureType}</div>
                          </div>
                        </div>
                        {/* PRICE */}
                        {xpRequired <= 0 ?
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xl text-citizens-gray">{item.price > 0 ? (`${item.price} ${item.paymentType}`) : "Free"}</span>
                            <div className="rotate-45 cursor-pointer" onClick={() => handleRemove(item.featureName || idx, item.featureType)}>
                              <PlusSVG className="fill-citizens-red" />
                            </div>
                          </div>
                          :
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <p className="font-light text-xs pr-2">{xpRequired} XP left</p>
                              <div className="bg-citizens-yellow px-2 py-1 rounded-full text-xs">
                                <BlockSVG />
                              </div>
                            </div>
                            <div className="rotate-45 cursor-pointer" onClick={() => handleRemove(item.featureName || idx, item.featureType)}>
                              <PlusSVG className="fill-citizens-red" />
                            </div>
                          </div>
                        }

                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="flex w-full justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">Total items: <span className="font-bold text-citizens-blue">{getTotalAvailableItems()}</span></p>
                  <p className="text-gray-400">Total price: <span className="font-bold text-citizens-blue">{getTotalPrice()} {shoppingCartItems[0]?.paymentType || 'XP'}</span></p>
                </div>
                <button className="bg-citizens-yellow text-citizens-dark font-bold px-4 py-2 rounded-xl hover:bg-citizens-yellow-hover transition-colors" onClick={onCheckOut}>
                  Checkout
                </button>
              </div>
            </>
          }
        </div>
      </div>
      {/* Shopping Cart Toggle Button */}
      <div className="absolute top-2 right-2 w-10 h-10 rounded-xl bg-citizens-yellow">
        <div className="flex items-center justify-center h-full w-full cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ?
            <div className="rotate-45">
              <PlusSVG className="fill-citizens-dark w-8 h-8 m-auto" />
            </div>
            :
            <BiCartAlt className="fill-citizens-dark w-6 h-6 m-auto" />
          }
        </div>
      </div>
      {/* Shopping Cart close Item Count */}
      {shoppingCartItems.length > 0 && !isOpen &&
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-citizens-red flex items-center justify-center">
          <p className="font-bold text-xs text-white">{shoppingCartItems.length}</p>
        </div>
      }
    </div>
  );
}