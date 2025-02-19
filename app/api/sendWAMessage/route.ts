import { sendWhatsAppMessage } from "@/app/api/sendMessage/sendMessage";
import { NextRequest, NextResponse } from "next/server";
import { DBTables } from "@/lib/enums/Tables";
import { createClient } from "@/utils/supabase-server";
import { TemplateRequest, TextParameter } from "@/types/message-template-request";
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*'
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: corsHeaders,
        });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return new NextResponse('Missing Authorization header', { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const isValidToken = await verifyToken(token);
    if (!isValidToken) {
        return new NextResponse('Invalid or expired token', { status: 403, headers: corsHeaders });
    }

    const supabase = createClient();
    const reqFormData = await request.formData();

    const to = reqFormData.get('Phone')?.toString();
    if (!to) {
        return new NextResponse('Missing "Phone" field', { status: 400, headers: corsHeaders });
    }

    const firstName = reqFormData.get('FirstName')?.toString();
    if (!firstName) {
        return new NextResponse('Missing "FirstName" field', { status: 400, headers: corsHeaders });
    }

    const lastName = reqFormData.get('LastName')?.toString();
    if (!lastName) {
        return new NextResponse('Missing "LastName" field', { status: 400, headers: corsHeaders });
    }

    const quoteGuid = reqFormData.get('PreventivoGuid')?.toString();
    if (!quoteGuid) {
        return new NextResponse('Missing "PreventivoGuid" field', { status: 400, headers: corsHeaders });
    }

    const hotelId = reqFormData.get('HotelId')?.toString();
    if (!hotelId) {
        return new NextResponse('Missing "hotelId" field', { status: 400, headers: corsHeaders });
    }

    const email = reqFormData.get('Email')?.toString();
    if (!email) {
        return new NextResponse('Missing "Email" field', { status: 400, headers: corsHeaders });
    }

    const languageCode = reqFormData.get('LanguageCode')?.toString();
    if (!languageCode) {
        return new NextResponse('Missing "LanguageCode" field', { status: 400, headers: corsHeaders });
    }

    const message = reqFormData.get('message')?.toString();
    const fileType = reqFormData.get('fileType')?.toString();
    const file: File | null = reqFormData.get('file') as File | null;

    //const languageCode = 'it-IT';

    let { data: hotelData, error: hotelError } = await supabase
    .from(DBTables.Hotels)
    .select('*')
    .eq('hotel_id', hotelId)
    .single();

    let hotelZone = hotelData.hotel_zone;
    let templateName = hotelData.template_preventivo_name;

    let template = await getTemplateRequest(firstName, languageCode, quoteGuid,templateName,hotelZone);

    let error = await sendWhatsAppMessage(to, message, fileType, file, template,hotelZone);
    if (error){
        return new NextResponse(error.message, { status: 400, headers: corsHeaders });
    }

    let { data: contactsData, error: contactsError } = await supabase
                          .from(DBTables.Contacts)
                          .select('wa_id')
                          .eq('wa_id', to)
                          .single();
    if (contactsError) console.error('Error while fetching contact or contact not in list:', contactsError);
    let contactInList = contactsData != null;

    if (contactInList)
    {
        let { error } = await supabase
                        .from(DBTables.Contacts)
                        .update({ last_message_at: new Date() })
                        .eq('wa_id', to);

        if (error) console.error('Error while updating contact:', error);

    }
    else
    {
        let { error } = await supabase
                        .from(DBTables.Contacts)
                        .upsert({
                        wa_id: to,
                        profile_name: firstName + " " + lastName,
                        last_message_at: new Date(),
                        last_message_received_at: new Date(),
                        in_chat: true,
                        email: email
                        })
        if (error) console.error('Error while adding contact:', error);
    }

    return new NextResponse('Whatsapp message sent', {
        status: 200,
        headers: corsHeaders
    });
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

async function checkTemplateLanguage(templateName: string, languageCode:string, hotelZone: number | null){

    const supabase = createClient();
    let businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (hotelZone != null){
        let { data: hotelZonesData, error: hotelZonesError } = await supabase
        .from(DBTables.HotelsZones)
        .select('whatsapp_account_id')
        .eq('zone_id', hotelZone)
        .single();

        if (hotelZonesError) {
            return new Error("Error fetching hotel zone data: " + hotelZonesError);
        } else if (!hotelZonesData) {
            return new Error("No matching row found for zone_id " + hotelZone);
        } else {
            if (hotelZonesData.whatsapp_account_id != "")
                {
                    businessAccountId = hotelZonesData.whatsapp_account_id;
            }
            else{
                return new Error("Hotel zone phone number empty");
            }
        }
    }

    //const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${businessAccountId}/message_templates?fields=name&name=${templateName}`;
    const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${businessAccountId}/message_templates`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
    };
    const res = await fetch(WHATSAPP_API_URL, {
        method: 'GET',
        headers
    });
    const response = await res.json();

    let templates = response.data.filter((p: { name: string; language: string; }) => p.name == templateName && p.language == languageCode.split("-")[0]);

    let translatedTemplateFound = templates != null && templates.length >= 1;
    console.log("Template found status: " + translatedTemplateFound);

    return true;
}

async function getTemplateRequest(firstName : string, languageCode:string, quoteGuid: string, templateName: string, hotelZone: number) : Promise<TemplateRequest>{

    let templateLanguage = "en";
    let translatedTemplateFound = await checkTemplateLanguage(templateName,languageCode,hotelZone);
    if (translatedTemplateFound){
        templateLanguage = languageCode.split("-")[0];
    }

    const templateRequest: TemplateRequest = {
        name: templateName,
        language: {
            code: templateLanguage
        },
        components: [
            {
                type: "header",
                parameters: [
                    {
                        type: "text",
                        text: firstName
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

