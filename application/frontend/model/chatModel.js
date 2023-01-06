let model = {
    logout: async function logout(){
        try{
            let response = await fetch("/logout", {
                method: "DELETE"
            });
            let result = await response.json();
            if (response.status===200){
                window.location.href = "/";
            }else{
                return false;
            }
        }catch(error){
            console.log({"error": error});
        }
    },
    refresh: async function refresh(){
        try{
            const response = await fetch("/refresh", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            let result = await response.json();
            if (response.status === 200){
                return true;
            }else{
                window.location.href = "/";
            }
        }catch(error){
            console.log({"error": error})
        }
    },
}
export default model;