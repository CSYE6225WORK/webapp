source "googlecompute" "centos8Image" {
  project_id          = "firm-reason-411722"
  source_image_family = "centos-stream-8"
  zone                = "us-east4-c"
  ssh_username        = "packer"
  image_name          = "webapp-image"
  machine_type        = "e2-standard-8"
  image_family        = "packer-centos-stream-8"
}

build {
  sources = ["source.googlecompute.centos8Image"]

  // Create a local user csye6225 with primary group csye6225. 
  provisioner "shell" {
    inline = [
      "sudo groupadd csye6225",
      "sudo useradd csye6225 -g csye6225 -s /usr/sbin/nologin"
    ]
  }

  // Install application dependencies
  provisioner "shell" {
    inline = [
      // Instal mysql and unzip
      "sudo dnf update -y",
      "sudo dnf install unzip -y",
      "sudo dnf install mysql-server -y",
      "sudo systemctl start mysqld",
      "sudo systemctl enable mysqld",
      // Install node v20
      "curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -",
      "sudo dnf install nodejs -y",
      "sudo node -v",
      "sudo npm install pnpm -g"
    ]
  }

  // Transfer file to custom image
  provisioner "file" {
    source      = "./temp.zip"
    destination = "/tmp/temp.zip"
  }

  // Transfer systemd file to custom image
  provisioner "file" {
    source      = "./packer/nodeapp.service"
    destination = "/tmp/nodeapp.service"
  }

  //  Change app is owned by user csye6225 and add systemd service
  provisioner "shell" {
    inline = [
      "sudo mkdir /opt/app",
      "sudo unzip -o /tmp/temp.zip -d /opt/app",
      "sudo bash -c 'echo \"DATABASE_URL='mysql://root@127.0.0.1:3306/CSYE6225'\" > /opt/app/.env'",
      "sudo pnpm install --prefix /opt/app",
      "sudo pnpm run -C /opt/app build",
      "sudo chown -R csye6225:csye6225 /opt/app",
      "sudo mv /tmp/nodeapp.service /etc/systemd/system/",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable nodeapp.service"
    ]
  }
}
