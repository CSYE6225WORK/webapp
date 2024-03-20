source "googlecompute" "centos8Image" {
  project_id          = "firm-reason-411722"
  source_image_family = "centos-stream-8"
  zone                = "us-east4-c"
  ssh_username        = "packer"
  image_name          = "webapp-image-{{timestamp}}"
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
      "curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh",
      "sudo bash add-google-cloud-ops-agent-repo.sh --also-install",
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

  // Transfer Ops Agent config file to custom image
  provisioner "file" {
    source      = "./packer/config.yaml"
    destination = "/tmp/config.yaml"
  }

  //  Change app is owned by user csye6225 and add systemd service
  provisioner "shell" {
    inline = [
      "sudo mkdir /opt/app",
      "sudo unzip -o /tmp/temp.zip -d /opt/app",
      "sudo pnpm install --prefix /opt/app",
      "sudo pnpm run -C /opt/app build",
      "sudo chown -R csye6225:csye6225 /opt/app",
      "sudo mv /tmp/nodeapp.service /etc/systemd/system/",
      "sudo mv /tmp/config.yaml /etc/google-cloud-ops-agent/",
      "sudo systemctl daemon-reload",
      "sudo systemctl restart google-cloud-ops-agent"
    ]
  }
}
