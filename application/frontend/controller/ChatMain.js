import model from "../model/chatModel.js";
import view from "../view/chatView.js";

console.log("test");
const logout = document.getElementById("logout");
let controller = {
    init: async function(){
        await model.refresh();
    }
};
controller.init();

logout.addEventListener("click", ()=>{
    model.logout();
});