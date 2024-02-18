source "googlecompute" "centos8Image" {
  project_id          = "firm-reason-411722"
  source_image_family = "centos-stream-8"
  zone                = "us-east4-c"
  ssh_username        = "packer"
  image_name          = "packer-centos-stream-8-{{timestamp}}"
  image_famil         = "packer-centos-stream-8"
}

build {
  sources = ["source.googlecompute.centos8Image"]
  provisioner "shell" {
    inline = [
      // Install NVM
      "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash",
      "source ~/.nvm/nvm.sh",
      // Install node version
      "nvm install v20",
      "nvm use v20",
      "nvm alias default v20",
      // Install PM2 from nvm
      "npm install pm2 -g",

      // Instal mysql
      "sudo yum update -y",
      "sudo yum install mysql-server -y",
      "sudo systemctl start mysqld",
      "sudo systemctl enable mysqld",
    ]
  }
}