use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

solana_program::entrypoint!(process_instruction);

// program entrypoint's implementation
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello CPI world, I'm child module, I'm called from main module!");

    let account_info_iter = &mut accounts.iter();
    let one_user: &AccountInfo<'_> = next_account_info(account_info_iter)?;

    // 清空账户数据
    for byte in one_user.data.borrow_mut().iter_mut() {
        *byte = 0;
    }

    // gracefully exit the program
    Ok(())
}
