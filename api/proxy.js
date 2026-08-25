export default async function handler(req,res){
    try{
        const url=req.query.url;
        if(!url||!/^https?:\/\//i.test(url))return res.status(400).send("Invalid URL");

        const response=await fetch(url);
        const type=response.headers.get("content-type")||"";

        if(!type.includes("text/html")){
            res.setHeader("Content-Type",type);
            return res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
        }

        let html=await response.text();
        html=html.replace(/<head([^>]*)>/i,`<head$1><base href="${new URL(url).href}">`);
        html=html.replace(/<meta[^>]+http-equiv=["']?X-Frame-Options["']?[^>]*>/gi,"");

        res.setHeader("Content-Type","text/html; charset=utf-8");
        return res.status(response.status).send(html);
    }catch(e){
        return res.status(500).send("Proxy error: "+e.message);
    }
}
