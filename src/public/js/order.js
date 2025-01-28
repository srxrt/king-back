console.log("Orders frontend javascript file");

$(function () {
  $(".new-product-status").on("change", async (e) => {
    const id = e.target.id;
    const orderStatus = $(`#${id}.new-product-status`).val();
    try {
      const result = await axios.post(`/admin/order/${id}`, {
        orderStatus: orderStatus,
      });
      if (result.data) {
        $(".new-product-status").blur();
      } else {
        alert("Order update failed!");
      }
    } catch (err) {
      console.log(err);
      alert("Order update failed!");
    }
  });
});
