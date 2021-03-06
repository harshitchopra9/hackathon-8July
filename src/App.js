import React, { useState } from "react";
import "./App.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { mockData, cartData } from "./mockData";
import emailjs from "@emailjs/browser"

function App() {
  const [openModal, setOpenModal] = React.useState(false);
  const [splitEquallySelected, setSplitEquallySelected] = useState(false);
  const [splitIndividuallySelected, setSplitIndividuallySelected] =
    useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [friendPrefferedPayment, setFriendPrefferedPayment] = useState("");
  const [showEnterFriendDetailsForm, setShowEnterFriendDetailsForm] =
    useState(false);
  const [selectedFriendsList, setSelectedFriendsList] = useState([]);
  const [selectedOptionValue, setSelectedOptionValue] = useState([]);
  const [splitEquallyButtonClicked, setSplitEquallyButtonClicked] =
    useState(false);
  const [splitIndividuallyButtonClicked, setSplitIndividuallyButtonClicked] =
    useState(false);
  const [cartTotal, setCartTotal] = useState("");
  const [
    eachPersonHasToPayHowMuchDifferentAmount,
    setEachPersonHasToPayHowMuchDifferentAmount,
  ] = useState([]);

  // incase of splitting equally among all the friends (including the person who is ordering)
  const [eachPersonHasToPay, setEachPersonHasToPay] = useState("");
  const [splitTheBillButtonClicked, setSplitTheBillButtonClicked] =
    useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setSplitEquallyButtonClicked(false);
    setSplitIndividuallyButtonClicked(false);
  };

  function splitEqually(cartTotal) {
    setCartTotal(cartTotal);
    setSplitEquallySelected(true);
    setShowEnterFriendDetailsForm(true);
    setSplitEquallyButtonClicked(true);
  }
  function splitIndividually() {
    setSplitIndividuallySelected(true);
    setShowEnterFriendDetailsForm(true);
    setSplitIndividuallyButtonClicked(true);
  }

  function addFriendModalButton() {
    if (!friendName || !friendEmail || !friendPhone) {
      alert("Name, Email or Password cannot be empty");
      return;
    }
    if (friendPhone.length < 10) {
      alert("Phone number cannot be less than 10 digits");
      return;
    }
    friendsList.push({
      name: friendName,
      email: friendEmail,
      phone: friendPhone,
      preferredPayment: friendPrefferedPayment,
    });
    setShowEnterFriendDetailsForm(false);
    setFriendName("");
    setFriendEmail("");
    setFriendPhone("");
    setFriendPrefferedPayment("");
  }
  function addMoreFriendsButton() {
    setShowEnterFriendDetailsForm(true);
  }

  function setFriendsDataInLocalStorage() {
    friendsList.unshift({
      name: "Me",
      email: "myemail@gmail.com",
      phone: "8602410771",
    });
    localStorage.setItem("friendsList", JSON.stringify(friendsList));
  }
  function getFriendsDataInLocalStorage() {
    if (localStorage.getItem("friendsList") === null) {
      return;
    }
    const getFriendsArrayFromLocalStorage = JSON.parse(
      localStorage.getItem("friendsList")
    );
    setSelectedFriendsList([
      ...selectedFriendsList,
      ...getFriendsArrayFromLocalStorage,
    ]);
  }

  function submitFriendsDetails() {
    setFriendsDataInLocalStorage();
    handleCloseModal();
    getFriendsDataInLocalStorage();
    if (splitEquallyButtonClicked) {
      const totalPersons = friendsList.length;
      setEachPersonHasToPay(mockData.totalAmount / totalPersons);
      return;
    }
  }

  function onSelectOptionChange(friendName, itemName, itemPrice) {
    setSelectedOptionValue([
      ...selectedOptionValue,
      {
        friendName: friendName,
        itemName: itemName,
        itemPrice: itemPrice / 100,
      },
    ]);
  }

  function eachPersonHasToPayAccordingToTheirOrder() {
    setSplitTheBillButtonClicked(true);
    var total = 0;
    selectedFriendsList.map((value) => {
      total = 0;
      selectedOptionValue.filter((val) => {
        if (val.friendName == value.name) {
          total += val.itemPrice;
        }
      });
      eachPersonHasToPayHowMuchDifferentAmount.push({
        name: value.name,
        total: total,
        email: value.email,
        preferredPayment: value.preferredPayment
      });
    });
  }

  function roundOffToTwoDigits(num) {
    return Math.round(num * 100) / 100;
  }

  function divideDeliveryDiscountAndChargesEqually() {
    return (
      (mockData.deliveryFee +
        mockData.taxesAndCharges -
        mockData.itemDiscount) /
      friendsList.length
    );
  }

  function onTypingFriendsPhoneNumber(value) {
    let mobile = friendPhone;
    if (/^[0-9]*$/.test(value) && value.length <= 10) {
      mobile = value;
    }
    setFriendPhone(mobile);
  }

  function sendEmail(name, email, price, preferredPaymentMode) {
    if (!price) {
      return
    }
    emailjs.send(
      "service_aro12vh",
      "template_o7hpbdd",
      {
        from_name: 'Team Splitter',
        to_email: email,
        to_name: name,
        message: `Hey, ${name}. You owe ${roundOffToTwoDigits(price)} INR for the swiggy order number 874169. You can pay them through ${preferredPaymentMode}.`,
        reply_to: 'chopraharshit9999@gmail.con',
      },
      "0Z51IHiRj7oUS8igM"
    )
      .then((response) => {
        console.log('Hurray, Message Sent!');
      })
      .catch((err) => {
        console.log('FAILED...', err);
      })
  }

  function onSubmit(e) {
    e.preventDefault();

    if (eachPersonHasToPay) {
      selectedFriendsList
        .filter((val) => val.name !== "Me")
        .map((value) => (
          sendEmail(value.name, value.email, eachPersonHasToPay, value.preferredPayment)
        ))
      return;
    }

    if (eachPersonHasToPayHowMuchDifferentAmount.length > 0) {
      eachPersonHasToPayHowMuchDifferentAmount
        .filter((val) => val.name !== "Me")
        .map((value) => (
          sendEmail(value.name, value.email, value.total !== 0 && value.total + divideDeliveryDiscountAndChargesEqually(), value.preferredPayment)
        ))
    }
  };

  return (
    <div className="App">
      <div className="split_banner">
        <p>Want to split bill ?</p>
        <button onClick={handleOpenModal}>Add Details</button>
      </div>

      <Modal
        open={openModal}
        // onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal_styles">
          <div className="modal_container">
            <p onClick={handleCloseModal} className="modal_close">
              &#10007;
            </p>
            {!splitEquallySelected && !splitIndividuallySelected ? (
              <div className="modal_split_buttons_container">
                <button onClick={() => splitEqually(cartData.data.cart_total)}>
                  Split Equally
                </button>
                <button onClick={splitIndividually}>Split Individually</button>
              </div>
            ) : (
              <div className="modal_friends_details_container">
                {showEnterFriendDetailsForm ? (
                  <div className="modal_friends_details_true">
                    <p>Enter your friend's details</p>
                    <input
                      placeholder="Name"
                      required
                      type="text"
                      value={friendName}
                      onChange={(e) => setFriendName(e.target.value)}
                    />
                    <input
                      placeholder="Email"
                      required
                      type="email"
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                    />
                    <input
                      placeholder="Phone Number"
                      required
                      type="number"
                      value={friendPhone}
                      onChange={(e) =>
                        onTypingFriendsPhoneNumber(e.target.value)
                      }
                    />
                    <input
                      placeholder="Preferred Payment"
                      required
                      type="text"
                      value={friendPrefferedPayment}
                      onChange={(e) =>
                        setFriendPrefferedPayment(e.target.value)
                      }
                    />
                    <button onClick={addFriendModalButton}>ADD FRIEND</button>
                  </div>
                ) : (
                  <>
                    {friendsList.length > 0 &&
                      friendsList.map((value) => (
                        <div className="modal_added_friends_details">
                          <p>
                            <span className="modal_added_friends_details_span_title">
                              Name:
                            </span>{" "}
                            <span className="modal_added_friends_details_span_value">
                              {value.name}
                            </span>
                          </p>
                          <p>
                            <span className="modal_added_friends_details_span_title">
                              Email:
                            </span>{" "}
                            <span className="modal_added_friends_details_span_value">
                              {value.email}
                            </span>
                          </p>
                          <p>
                            <span className="modal_added_friends_details_span_title">
                              Phone:
                            </span>{" "}
                            <span className="modal_added_friends_details_span_value">
                              {value.phone}
                            </span>
                          </p>
                          <p>
                            <span className="modal_added_friends_details_span_title">
                              Pref. Payment:
                            </span>{" "}
                            <span className="modal_added_friends_details_span_value">
                              {value.preferredPayment}
                            </span>
                          </p>
                        </div>
                      ))}
                    <button
                      onClick={addMoreFriendsButton}
                      className="add_more_friends_button"
                    >
                      {" "}
                      Add more friends
                    </button>
                    <button
                      onClick={submitFriendsDetails}
                      className="submit_friends_details_button"
                    >
                      Continue
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </Box>
      </Modal>

      <div className="cart_green_coupon">
        <p className="cart_green_coupon_title">???79 total savings</p>
        <p className="cart_green_coupon_subtitle">with TRYNEW coupon</p>
      </div>

      {cartData.data.cart_menu_items.map((value, key) => (
        <div className="cart_data_item">
          <div className="cart_data_item_name_subtotal">
            <p className="cart_data_item_name">{value.name}</p>
            <p className="cart_data_item_price">???{value.subtotal / 100}.00</p>
          </div>

          {splitIndividuallySelected && selectedFriendsList.length > 0 && (
            <>
              <span className="cart_data_item_ordering_for">Ordering for?</span>
              <select
                name="Choose"
                onChange={(e) =>
                  onSelectOptionChange(
                    e.target.value,
                    value.name,
                    value.subtotal
                  )
                }
              >
                <option>Choose</option>
                {selectedFriendsList.map((value) => (
                  <option value={selectedOptionValue[`select-${key}`]}>
                    {" "}
                    {value.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      ))}

      <div className="no_contact_delivery_super_container">
        <div className="no_contact_delivery_container">
          <p className="no_contact_delivery_title">
            Opt in for No-contact Delivery
          </p>
          <p className="no_contact_delivery_desc">
            Unwell, or avoiding contact? Please select no-contact delivery.
            Partner will safely place the order outside your door (not for COD)
          </p>
        </div>
      </div>

      <div className="bill_details_container">
        <p className="bill_details_title">Bill Details</p>
        <div className="bill_details_item_total_container">
          <p className="bill_details_item_total_title">Item Total</p>
          <p className="bill_details_item_total_price">???{mockData.itemTotal}</p>
        </div>
        <div className="bill_details_delivery_fee_container">
          <p className="bill_details_delivery_fee_title">
            Delivery Fee | 6.8 kms
          </p>
          <p className="bill_details_delivery_fee_price">
            ???{mockData.deliveryFee}
          </p>
        </div>
        <p className="bill_details_delivery_fee_desc">
          Your delivery partner will be paid fairly as this is a long distance
          order!
        </p>
        <div className="bill_details_item_discount_container">
          <p className="bill_details_item_discount_title">Item Discount</p>
          <p className="bill_details_item_discount_price">
            -???{mockData.itemDiscount}
          </p>
        </div>
        <div className="bill_details_item_total_container">
          <p className="bill_details_item_total_title">Delivery Tip</p>
          <p className="bill_details_item_total_price add_tip_color">Add Tip</p>
        </div>
        <div className="bill_details_item_total_container taxes_charges_container">
          <p className="bill_details_item_total_title">Taxes and Charges</p>
          <p className="bill_details_item_total_price">
            ???{mockData.taxesAndCharges}
          </p>
        </div>

        {eachPersonHasToPay && (
          <div className="friends_and_personal_payment_breakup">
            <div className="personal_payment_breakup">
              {eachPersonHasToPay &&
                selectedFriendsList
                  .filter((val) => val.name == "Me")
                  .map((value) => (
                    <p>
                      Your share is ???{roundOffToTwoDigits(eachPersonHasToPay)}
                    </p>
                  ))}
            </div>

            <div className="friends_payment_breakup">
              {eachPersonHasToPay &&
                selectedFriendsList
                  .filter((val) => val.name !== "Me")
                  .map((value) => (
                    <p>
                      {value.name} has to pay ???
                      {roundOffToTwoDigits(eachPersonHasToPay)}
                    </p>
                  ))}
            </div>
          </div>
        )}

        {!splitTheBillButtonClicked &&
          splitIndividuallySelected &&
          selectedFriendsList.length > 0 && (
            <button
              onClick={eachPersonHasToPayAccordingToTheirOrder}
              className="split_the_bill_button"
            >
              Split the bill
            </button>
          )}

        {eachPersonHasToPayHowMuchDifferentAmount.length > 0 &&
          splitTheBillButtonClicked && (
            <div className="friends_and_personal_payment_breakup everyone_pays_for_their_order">
              <div className="personal_payment_breakup">
                {eachPersonHasToPayHowMuchDifferentAmount.length > 0 &&
                  eachPersonHasToPayHowMuchDifferentAmount
                    .filter((val) => val.name == "Me")
                    .map((value) => (
                      <p>
                        Your share is ???
                        {roundOffToTwoDigits(
                          value.total !== 0 &&
                          value.total +
                          divideDeliveryDiscountAndChargesEqually()
                        )}
                      </p>
                    ))}
              </div>

              <div className="friends_payment_breakup">
                {eachPersonHasToPayHowMuchDifferentAmount.length > 0 &&
                  eachPersonHasToPayHowMuchDifferentAmount
                    .filter((val) => val.name !== "Me")
                    .map((value) => (
                      <p>
                        {value.name} has to pay ???
                        {roundOffToTwoDigits(
                          value.total !== 0 &&
                          value.total +
                          divideDeliveryDiscountAndChargesEqually()
                        )}
                      </p>
                    ))}
              </div>
            </div>
          )}
        <div className="bill_details_item_total_container to_pay_container">
          <p className="bill_details_item_total_title to_pay_title">To Pay</p>
          <p className="bill_details_item_total_price to_pay_price">
            ???{mockData.totalAmount}
          </p>
        </div>
      </div>

      <div className="fixed_footer">
        <p className="fixed_footer_left">
          <p className="fixed_footer_left_price">???541</p>
          <p className="fixed_footer_left_text">VIEW DETAILED BILL</p>
        </p>
        <p className="fixed_footer_right">
          <p onClick={(e) => onSubmit(e)}>MAKE PAYMENT</p>
        </p>
      </div>
    </div>
  );
}

export default App;
