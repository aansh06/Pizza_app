// const Order = require('../../../models/order')

// function statusController(){
//     return{
//         update(req,res){
//             Order.updateOne({_id: req.body.orderId},{status:req.body.status},(err,data)=>{
//                 if(err){
//                     return res.redirect('/admin/orders')
//                 }
//                 return res.redirect('/admin/orders')
//             })
//         }
//     }
// }

// module.exports = statusController

const Order = require('../../../models/order');

function statusController() {
    return {
        async update(req, res) {
            try {
                const orderId = req.body.orderId;
                const newStatus = req.body.status;

                // Update the order using async/await and Promises
                await Order.updateOne({ _id: orderId }, { status: newStatus });

                // Redirect upon successful update
                const eventEmitter=req.app.get('eventEmitter')
                eventEmitter.emit('orderUpdated',{id:req.body.orderId , status:req.body.status})
                return res.redirect('/admin/orders');
            } catch (error) {
                console.error(error);
                return res.redirect('/admin/orders');
            }
        }
    };
}

module.exports = statusController;
