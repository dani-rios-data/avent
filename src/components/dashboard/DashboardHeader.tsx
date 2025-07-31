import breastPumpIcon from "@/assets/breast_pump.png";

const DashboardHeader = () => {
  return (
    <div className="p-6 pb-2">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 flex items-center justify-center rounded-full overflow-hidden">
          <img src={breastPumpIcon} alt="Breast pump icon" className="w-24 h-24 object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
            Philips Avent Breastfeeding
          </h1>
          <p className="text-base text-muted-foreground font-light mt-1">
            Competitive Analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;