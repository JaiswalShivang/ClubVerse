"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UploadCloud } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUserProfile } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState(user?.name || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profileImageUrl || null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name)
      setPreviewUrl(user.profileImageUrl || null)
      setAvatarFile(null) // Reset file on open
    }
  }, [user, isOpen])

  const handleFileSelect = (file: File | null) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please select an image smaller than 2MB.",
        })
        return
      }
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select a valid image file (PNG, JPG, etc.).",
        })
        return
      }
      setAvatarFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null)
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(e.dataTransfer.files?.[0] || null)
  }

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)
    try {
      await updateUserProfile({ name, avatarFile })
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
      onClose()
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your name and profile picture. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label>Avatar</Label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex flex-col gap-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl || undefined} />
                  <AvatarFallback className="text-3xl">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs text-gray-500 pl-1">
                  PNG, JPG up to 2MB.
                </p>
              </div>
              <Label
                htmlFor="avatar-upload"
                className="flex h-full w-full sm:flex-1 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 transition-colors hover:border-blue-500 hover:bg-blue-50"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                <UploadCloud className="mx-auto h-6 w-6 mb-1" />
                <span>Click or drag file</span>
              </Label>
              <Input
                ref={fileInputRef}
                id="avatar-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
