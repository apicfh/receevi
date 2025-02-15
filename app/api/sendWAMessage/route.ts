import { sendWhatsAppMessage } from "@/app/api/sendMessage/sendMessage";
import { NextRequest, NextResponse } from "next/server";
import { DBTables } from "@/lib/enums/Tables";
import { createClient } from "@/utils/supabase-server";
import { TemplateRequest, TextParameter } from "@/types/message-template-request";
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest, response: NextResponse) {

    // Set CORS headers to allow any origin
    // const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');  // Allow requests from any origin
    response.headers.set('Access-Control-Allow-Methods', 'POST');  // Allow the necessary HTTP methods
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');  // Allow the required headers

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return new NextResponse('Missing Authorization header', { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const isValidToken = await verifyToken(token);
    if (!isValidToken) {
        return new NextResponse('Invalid or expired token', { status: 403 });
    }

    const supabase = createClient()
    const reqFormData = await request.formData()

    const to = reqFormData.get('Phone')?.toString()
    if (!to) {
        return new NextResponse('Missing "Phone" field', { status: 400 })
    }

    const name = reqFormData.get('Name')?.toString()
    if (!name) {
        return new NextResponse('Missing "Name" field', { status: 400 })
    }

    const quoteGuid = reqFormData.get('PreventivoGuid')?.toString()
    if (!quoteGuid) {
        return new NextResponse('Missing "PreventivoGuid" field', { status: 400 })
    }

    const message = reqFormData.get('message')?.toString()
    const fileType = reqFormData.get('fileType')?.toString()
    const file: (File | null) = reqFormData.get('file') as (File | null)

    // const reqFormDataTemplate = reqFormData.get('template')?.toString()
    // const template: (TemplateRequest | null | undefined) = reqFormDataTemplate && JSON.parse(reqFormDataTemplate)
    

    // if (!message && !file && !template) {
    //     return new NextResponse(null, { status: 400 })
    // }
    const languageCode = "it-IT";
    const template = getTemplateRequest(name,languageCode,quoteGuid)
    await sendWhatsAppMessage(to, message, fileType, file, template)
    let { error } = await supabase
        .from(DBTables.Contacts)
        .update({
            last_message_at: new Date(),
        })
        .eq('wa_id', to)
    if (error) console.error('error while updating last message field')
    return new NextResponse()
}

function verifyToken(token: string): boolean {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);
        return !!decoded; // Token is valid
    } catch (err) {
        console.error('Token verification failed:', err);
        return false; // Token is invalid
    }
}

function getTemplateRequest(name : string, languageCode:string, quoteGuid: string) : TemplateRequest{
    const templateRequest: TemplateRequest = {
        name: "modello_invio_preventivo_standard",
        language: {
            code: languageCode.split("-")[0]
        },
        components: [
            {
                type: "header",
                parameters: [
                    {
                        type: "text",
                        text: name
                    }
                ]
            },
            {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [
                    {
                        type : "payload",
                        payload : languageCode + "/Quotation?guid=" + quoteGuid
                    }
                ]
            }
        ]
    };

    return templateRequest;
}

