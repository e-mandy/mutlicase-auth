import { AppError } from "../../domain/exceptions/AppError.ts";
import axios from 'axios';

export class GithubExchange {
    private github_id;
    private github_secret;
    private github_callback;
    private github_url_post = "https://github.com/login/oauth/access_token";

    constructor(){
        if(!process.env.GITHUB_ID) throw new AppError('ENV DATA NOT LOAD', 500);
        if(!process.env.GITHUB_SECRET) throw new AppError('ENV DATA NOT LOAD', 500);
        if(!process.env.GITHUB_CALLBACK) throw new AppError('ENV DATA NOT LOAD', 500);

        this.github_id = process.env.GITHUB_ID;
        this.github_secret = process.env.GITHUB_SECRET;
        this.github_callback = process.env.GITHUB_CALLBACK;
    }

    async execute(code: string){
        try{

            const params = new URLSearchParams({
                code,
                client_id: this.github_id,
                client_secret: this.github_secret,
                redirect_uri: this.github_callback
            });
    
            const response = await axios.post(this.github_url_post, params.toString(), {
                headers: {
                    'Content-Type': "application/x-www-form-urlencoded"
                }
            });
    
            return response.data.access_token as string;
        }catch(error: any){
            throw new AppError(error.name, 500);
        }
    }
}