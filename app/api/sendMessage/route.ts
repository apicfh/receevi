import { sendWhatsAppMessage } from "@/app/api/sendMessage/sendMessage";
import { NextRequest, NextResponse } from "next/server";
import { DBTables } from "@/lib/enums/Tables";
import { createClient } from "@/utils/supabase-server";
import { TemplateRequest, TextParameter } from "@/types/message-template-request";

export async function POST(request: NextRequest) {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
        return new NextResponse(null, { status: 401 })
    }
    const reqFormData = await request.formData()
    const message = reqFormData.get('message')?.toString()
    const fileType = reqFormData.get('fileType')?.toString()
    const file: (File | null) = reqFormData.get('file') as (File | null)

    const reqFormDataTemplate = reqFormData.get('template')?.toString()
    const template: (TemplateRequest | null | undefined) = reqFormDataTemplate && JSON.parse(reqFormDataTemplate)
    const to = reqFormData.get('to')?.toString()
    if (!to) {
        return new NextResponse(null, { status: 400 })
    }
    if (!message && !file && !template) {
        return new NextResponse(null, { status: 400 })
    }
    await sendWhatsAppMessage(to, message, fileType, file, template, null)
    let { error } = await supabase
        .from(DBTables.Contacts)
        .update({
            last_message_at: new Date(),
        })
        .eq('wa_id', to)
    if (error) console.error('error while updating last message field')
    return new NextResponse()
}
