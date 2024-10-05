![teste](https://github.com/user-attachments/assets/1572ad33-df25-4dc9-bf87-18c22379e39a)

(Neccessary)
Aylur's GTK Shell (AGS),
kitty,
Hyprland,
swww,
yay,

(optional)
fuzzel,
A nerd font like FantasqueSansM,
Papirus Icon Theme,
grim,
slurp,
fastfetch,
starship,
fish,

(STEP 1)
If you're on Arch, you can simple run this and it will install all the stuff:

`yay -S starship fastfetch grim slurp fish aylur-gtk-shell hyprland ttf-fantasquesansm-nerd swww papirus-icon-theme kitty fuzzel git base-devel`

(OPTIONAL) maybe there are some other dependencies like mpris, bluetooth, so if anything goes wrong, run this command too:
`sudo pacman -Syu upower networkmanager pipewire-pulse libdbusmenu-gtk3 ttf-hanazono gvfs xdg-user-dirs`

(STEP 2)
Clone the repo with:
`git clone https://github.com/larkjkj/dotfiles/`
Make a .config folder(probally you have)
`mkdir ~/.config`
Move the content from dotfiles to .config and delete the dotfiles folder
`mv ~/dotfiles ~/.config/`

You can test it, by running hyprland
enjoy :)
