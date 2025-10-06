import { useEffect, useState } from "react";
import { setCheckoutMode, setMarketplaceMode, setShoppingCart } from "../../../store/citizensMetadataSlice";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { FeatureClaimableDrop } from "../../../interfaces/citizens.interface";
import PlusSVG from "../common/SVG/plusSVG.ui";
import Image from "next/image";
import BlockSVG from "../common/SVG/blockSVG.ui";
import { BiCartAlt, BiCollapseAlt, BiExpandAlt, BiSolidTrash } from 'react-icons/bi';
import { useSnackbar } from "../snackbar/snackbar.provider";
import Modal from "../common/modal.ui";
import Button from "../common/button.ui";
import GetImage from "../../../components/commons/getImage.component";
import { FeatureKind } from "../../../enums/citizens/common.enum";

interface ShoppingCartUIProps {
  onRemoveItem: (type?: string) => Promise<void>;
  onCheckOut: () => Promise<boolean>;
}

export default function ShoppingCartUI({ onRemoveItem, onCheckOut }: ShoppingCartUIProps) {
  const shoppingCart = useAppSelector(state => state.citizensMetadata.shoppingCart);
  const claimableDrops = useAppSelector(state => state.citizensMetadata.claimableDrops);
  const userXP = useAppSelector(state => state.citizensAuth.xpData);
  const didCheckoutMode = useAppSelector(state => state.citizensMetadata.checkoutMode);
  const isMarketplaceMode = useAppSelector(state => state.citizensMetadata.marketplaceMode);
  const selectedCampaign = useAppSelector(state => state.citizensMetadata.selectedCampaign);
  const dispatch = useAppDispatch();

  const { showSnackbar } = useSnackbar();

  const [shoppingCartItems, setShoppingCartItems] = useState<FeatureClaimableDrop[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const handleRemove = (id: string | number, type: string) => {
    const updatedCart = shoppingCart.filter(item => item.val !== id);
    dispatch(setShoppingCart(updatedCart));
    onRemoveItem(type);
  };

  const handleCleanCart = () => {
    dispatch(setShoppingCart([]));
    setShoppingCartItems([]);
    onRemoveItem();
  };

  const getTotalAvailableItems = () => {
    return shoppingCartItems.length;
  }

  const getTotalPrice = () => {
    const total = shoppingCartItems
      .reduce((sum, item) => sum + (item.price || 0), 0);
    return Math.round(total * 10) / 10;
  }

  async function handleCheckout() {
    if (!onCheckOut) {
      showSnackbar(<p>Ups. We can't checkout right now, please try again later.</p>);
      return;
    }
    dispatch(setCheckoutMode(true));
    const isSuccess = await onCheckOut();
    dispatch(setCheckoutMode(false));
    
    if (isSuccess) {
      // Clear cart directly without triggering reset functionality
      dispatch(setShoppingCart([]));
      // Exit marketplace mode and return to homebase
      dispatch(setMarketplaceMode(false));
      showSnackbar(<p>Your purchase was successful!</p>);
    } else {
      showSnackbar(<p>Ups. We can't process your checkout right now, please try again later.</p>);
    }
  }

  function handleOpen() {
    if (isMarketplaceMode) setIsCollapsed(!isCollapsed)
    else dispatch(setMarketplaceMode(true));
  }

  useEffect(() => {
    if (!claimableDrops || !selectedCampaign) return;

    // Flatten the claimableDrops object to an array
    const selectedCampaignDrops = claimableDrops[selectedCampaign];

    // Filter the claimable drops based on the shopping cart, excluding blocked items
    const items = selectedCampaignDrops.filter(drop =>
      shoppingCart.some(cartItem =>
        cartItem.detail === drop.type &&
        cartItem.val === drop.name
      ) && drop.kind === FeatureKind.ClaimableDrop && (drop.requiredXP - (userXP?.xp || 0)) <= 0 && !drop.isLimitReached
    ) as FeatureClaimableDrop[];

    setShoppingCartItems(items);
  }, [shoppingCart, claimableDrops]);

  return (
    <>
      {/* CART OR CHECKOUT LOADING */}
      {didCheckoutMode ?
        <div className="fixed bottom-6 right-6 w-fit bg-black/25 backdrop-blur-sm px-6 py-4 rounded-2xl transition duration-300 ease-in-out animate-slide-in">
          <div className="text-white text-center flex justify-center items-center gap-4">
            <div className="w-2 sm:w-2 h-2 sm:h-4 border-t border-citizens-gray rounded-full animate-spin" />
            <div className="text-start">
              <p>Checking out...</p>
              <p className="text-xs">Do not close this window until the process is finished.</p>
            </div>
          </div>
        </div>
        :
        <div className={`fixed top-24 xl:top-auto xl:bottom-4 right-4 rounded-[20px] ${isMarketplaceMode ? 'w-[calc(100vw_-_2rem)] md:w-[419px] h-auto' : 'w-32 h-14'} overflow-hidden`}>
          <div className={`bg-citizens-dark/10 xl:bg-citizens-dark/80 backdrop-blur-sm shadow-citizens-btn w-full pr-2 pl-4 py-2 text-white`}>
            <div className={`${isMarketplaceMode ? 'opacity-100' : 'opacity-0'} grid grid-rows-[auto_1fr_auto] gap-4 max-h-[35vh] xl:max-h-[70vh] 2xl:max-h-[90vh]`}>
              <div className="flex justify-between items-center pr-12 h-10">
                {/* TITLE */}
                <h2 className="text-xl font-bold">Shopping cart</h2>
                {/* CLEAN BUTTON */}
                {shoppingCartItems.length > 0 &&
                  <div className="w-10 h-10 rounded-xl border border-citizens-yellow">
                    <div className="flex items-center justify-center h-full w-full cursor-pointer" onClick={() => handleCleanCart()}>
                      <BiSolidTrash className="fill-citizens-yellow w-4 h-4 m-auto" />
                    </div>
                  </div>
                }
              </div>
              {shoppingCartItems.length === 0 ? (
                <div className="text-center text-gray-400">Your cart is empty.</div>
              ) :
                <>
                  <div className={`overflow-y-auto overflow-x-hidden`}>
                    {/* ITEM LIST */}
                    <ul className={`${isCollapsed ? 'hidden' : 'block'}`}>
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
                                <div className="w-[50px] h-[50px] relative"><GetImage url={item.thumb} alt={item.name} /></div>
                              </div>
                              <div>
                                <div className="font-semibold text-xs">{item.name}</div>
                                <div className="text-gray-400 text-xs">{item.type}</div>
                              </div>
                            </div>
                            {/* PRICE */}
                            {xpRequired <= 0 ?
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xl text-citizens-gray">{item.price && item.price > 0 ? (`${item.price} ${item.paymentType}`) : "Free"}</span>
                                <div className="rotate-45 cursor-pointer" onClick={() => handleRemove(item.name || idx, item.type)}>
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
                                <div className="rotate-45 cursor-pointer" onClick={() => handleRemove(item.name || idx, item.type)}>
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
                    <button className="bg-citizens-yellow text-citizens-dark font-bold px-4 py-2 rounded-xl hover:bg-citizens-yellow-hover transition-colors" onClick={() => setIsCheckoutModalOpen(true)}>
                      Buy & Equip
                    </button>
                  </div>
                </>
              }
            </div>
          </div>
          {/* Shopping Cart Toggle Button */}
          <div className="absolute top-2 right-2 w-10 h-10 rounded-xl bg-citizens-yellow">
            <div className="flex items-center justify-center h-full w-full cursor-pointer" onClick={() => handleOpen()}>
              {isMarketplaceMode ?
                <div>
                  <BiExpandAlt className={`fill-citizens-dark w-4 h-4 m-auto ${isCollapsed ? 'block' : 'hidden'}`} />
                  <BiCollapseAlt className={`fill-citizens-dark w-4 h-4 m-auto ${isCollapsed ? 'hidden' : 'block'}`} />
                </div>
                :
                <div>
                  <p className="absolute top-1/2 -translate-y-1/2 right-full text-lg font-light text-white pr-3 leading-none">SHOP HERE</p>
                  <BiCartAlt className="fill-citizens-dark w-6 h-6 m-auto" />
                </div>
              }
            </div>
          </div>
          {/* Shopping Cart close Item Count */}
          {shoppingCartItems.length > 0 && (!isMarketplaceMode || isCollapsed) &&
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-citizens-red flex items-center justify-center">
              <p className="font-bold text-xs text-white">{shoppingCartItems.length}</p>
            </div>
          }
        </div>
      }
      {/* CHECKOUT MODAL */}
      {isCheckoutModalOpen &&
        <Modal handleClose={() => setIsCheckoutModalOpen(false)} modalStyles="w-[90vw] sm:!w-[492px]">
          <div className="grid justify-items-center">
            <div className="text-center text-white grid gap-4">
              <p className="font-bold text-2xl">Checkout</p>
              <p className="text-lg">Are you sure that you want to proceed to checkout?<br /><br />If you are using a custom wearable it will be burnt and you will not be able to use it again on a different Citizen.</p>
            </div>
            <div className="w-full grid grid-cols-2 gap-4 pt-8">
              <Button label="Go Back" light className="w-full" textStyles="w-full text-center" handleClick={() => setIsCheckoutModalOpen(false)} />
              <Button label="Checkout" light className="w-full" textStyles="w-full text-center" handleClick={() => {
                handleCheckout();
                setIsCheckoutModalOpen(false);
              }} />
            </div>
          </div>
        </Modal>
      }
    </>
  );
}