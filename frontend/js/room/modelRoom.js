let model = {
    refresh: async function refresh(){
        try{    
            const response = await fetch("/api/refresh", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (response.status === 200){
                return true;
            }else{
                window.location.href = "/";
            }
        }catch(error){
            console.log({"error": error})
        }
    },
    getUserData: async function getUserData(){
        try{
            let auth = await model.refresh();
            if (!auth){
                return false;
            }        
            const response = await fetch("/api/user/data", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const result = await response.json();
            return result
        }catch(error){
            console.log({"error": error})
        }
    }
}

export default model;